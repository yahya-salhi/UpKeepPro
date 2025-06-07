import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Play,
  Users,
  Clock,
  CheckCircle,
  Archive,
  BarChart3,
  MoreVertical,
  Copy,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

const TestManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedTests, setSelectedTests] = useState([]);
  const queryClient = useQueryClient();
  const authUser = queryClient.getQueryData(["authUser"]);

  // Check if user is formateur or admin
  const isFormateur = authUser?.role === "FORM" || authUser?.isAdmin;
  const isStagiaire = authUser?.role === "STAG";

  // Delete test mutation
  const { mutate: deleteTest, isPending: isDeleting } = useMutation({
    mutationFn: async (testId) => {
      const response = await fetch(`/api/tests/${testId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete test");
      }

      return response.json();
    },
    onSuccess: (_, testId) => {
      toast.dismiss(`delete-${testId}`);
      toast.success("Test deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
    onError: (error, testId) => {
      toast.dismiss(`delete-${testId}`);
      toast.error(error.message || "Failed to delete test");
    },
  });

  // Handle delete with confirmation
  const handleDeleteTest = (test) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${test.title}"?\n\nThis action cannot be undone and will permanently remove:\n- The test and all its questions\n- All student attempts and results\n- All associated data`
    );

    if (confirmDelete) {
      toast.loading("Deleting test...", { id: `delete-${test._id}` });
      deleteTest(test._id);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedTests.length === 0) {
      toast.error("Please select tests to delete");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedTests.length} test(s)?\n\nThis action cannot be undone and will permanently remove all selected tests and their data.`
    );

    if (confirmDelete) {
      toast.loading(`Deleting ${selectedTests.length} tests...`, {
        id: "bulk-delete",
      });

      // Delete tests one by one
      selectedTests.forEach((testId) => {
        deleteTest(testId);
      });

      setSelectedTests([]);
    }
  };

  // Handle select all tests
  const handleSelectAll = () => {
    if (selectedTests.length === tests.length) {
      setSelectedTests([]);
    } else {
      setSelectedTests(tests.map((test) => test._id));
    }
  };

  // Handle individual test selection
  const handleTestSelect = (testId) => {
    setSelectedTests((prev) =>
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId]
    );
  };

  const {
    data: testsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "tests",
      { search: searchTerm, status: statusFilter, category: categoryFilter },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);

      const response = await fetch(`/api/tests?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tests");
      }

      return response.json();
    },
  });

  const handlePublishTest = async (testId) => {
    try {
      toast.loading("Publishing test...", { id: `publish-${testId}` });

      const response = await fetch(`/api/tests/${testId}/publish`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to publish test");
      }

      toast.dismiss(`publish-${testId}`);
      toast.success("Test published successfully!");
      queryClient.invalidateQueries(["tests"]);
    } catch (error) {
      toast.dismiss(`publish-${testId}`);
      toast.error(error.message || "Failed to publish test");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-800", icon: Edit },
      published: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      archived: { color: "bg-red-100 text-red-800", icon: Archive },
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading tests: {error.message}
      </div>
    );
  }

  const tests = testsData?.data?.tests || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isStagiaire ? "Available Tests" : "Test Management"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isFormateur
              ? "Create and manage tests for your students"
              : isStagiaire
              ? "Take tests and view your progress"
              : "View and take available tests"}
          </p>
        </div>
        {isFormateur && (
          <div className="flex gap-2">
            <Link to="/test-results-dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <BarChart3 size={16} />
                View Results
              </Button>
            </Link>
            <Link to="/tests/create">
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Create Test
              </Button>
            </Link>
          </div>
        )}
        {isStagiaire && (
          <Link to="/my-results">
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 size={16} />
              My Results
            </Button>
          </Link>
        )}
      </div>

      {/* Bulk Actions Toolbar */}
      {isFormateur && selectedTests.length > 0 && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedTests.length} test(s) selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTests([])}
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                >
                  <Trash2 size={14} className="mr-1" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {isFormateur && tests.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedTests.length === tests.length}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Select All
                </label>
              </div>
            )}
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <Input
                  placeholder="Search tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Safety">Safety</SelectItem>
                <SelectItem value="Compliance">Compliance</SelectItem>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Training">Training</SelectItem>
                <SelectItem value="Assessment">Assessment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tests Grid */}
      {tests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <CheckCircle size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tests found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isFormateur
                ? "Get started by creating your first test"
                : isStagiaire
                ? "No tests are currently available for you to take"
                : "No tests are currently available"}
            </p>
            {isFormateur && (
              <Link to="/tests/create">
                <Button>Create Your First Test</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Card key={test._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1">
                    {isFormateur && (
                      <Checkbox
                        checked={selectedTests.includes(test._id)}
                        onCheckedChange={() => handleTestSelect(test._id)}
                        className="mt-1"
                      />
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {test.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {test.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(test.status)}
                    {isFormateur && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(`/tests/${test._id}/view`, "_blank")
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview Test
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/tests/${test._id}/view`
                              );
                              toast.success("Test link copied to clipboard!");
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteTest(test)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Test
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{test.totalQuestions} questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{test.duration} min</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Category: {test.category}</p>
                    <p>Passing Score: {test.passingScore}%</p>
                    <p>End Date: {formatDate(test.endDate)}</p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {isFormateur ? (
                      <>
                        <Link to={`/tests/${test._id}/edit`} className="flex-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Edit size={14} className="mr-1" />
                            Edit
                          </Button>
                        </Link>
                        {test.status === "draft" && (
                          <Button
                            size="sm"
                            onClick={() => handlePublishTest(test._id)}
                            className="flex-1"
                          >
                            <Play size={14} className="mr-1" />
                            Publish
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTest(test)}
                          disabled={isDeleting}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </>
                    ) : isStagiaire ? (
                      <>
                        <Link to={`/tests/${test._id}/take`} className="flex-1">
                          <Button
                            className="w-full"
                            disabled={test.status !== "published"}
                          >
                            <Play size={14} className="mr-1" />
                            Take Test
                          </Button>
                        </Link>
                        <Link to={`/tests/${test._id}/view`}>
                          <Button variant="outline" size="sm">
                            <Eye size={14} />
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to={`/tests/${test._id}/view`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <Eye size={14} className="mr-1" />
                            View Test
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestManagement;
