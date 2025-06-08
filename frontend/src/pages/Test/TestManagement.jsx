import { useState, useEffect } from "react";
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
  Download,
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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedTests, setSelectedTests] = useState([]);
  const queryClient = useQueryClient();
  const authUser = queryClient.getQueryData(["authUser"]);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  // Optimized bulk delete mutation using dedicated backend endpoint
  const { mutate: bulkDeleteTests, isPending: isBulkDeleting } = useMutation({
    mutationFn: async (testIds) => {
      const response = await fetch("/api/tests/bulk", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ testIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete tests");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.dismiss("bulk-delete");
      toast.success(`🎉 ${data.deletedCount} test(s) deleted successfully!`, {
        duration: 4000,
      });
      queryClient.invalidateQueries({ queryKey: ["tests"] });
      setSelectedTests([]);
    },
    onError: (error) => {
      toast.dismiss("bulk-delete");
      toast.error(error.message || "Failed to delete tests", {
        duration: 6000,
      });
      // Refresh the list to show current state
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });

  // Handle delete with confirmation using react-hot-toast
  const handleDeleteTest = (test) => {
    toast(
      (t) => (
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Delete Test</p>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete "{test.title}"?
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            This action cannot be undone and will permanently remove:
            <br />• The test and all its questions
            <br />• All student attempts and results
            <br />• All associated data
          </div>
          <div className="flex space-x-2 justify-end">
            <button
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              onClick={() => {
                toast.dismiss(t.id);
                toast.loading("Deleting test...", { id: `delete-${test._id}` });
                deleteTest(test._id);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          maxWidth: "400px",
        },
      }
    );
  };

  // Handle bulk delete with react-hot-toast confirmation
  const handleBulkDelete = () => {
    if (selectedTests.length === 0) {
      toast.error("Please select tests to delete");
      return;
    }

    toast(
      (t) => (
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                Delete Multiple Tests
              </p>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete {selectedTests.length} test(s)?
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            This action cannot be undone and will permanently remove all
            selected tests and their data.
          </div>
          <div className="flex space-x-2 justify-end">
            <button
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              onClick={() => {
                toast.dismiss(t.id);
                toast.loading(`Deleting ${selectedTests.length} tests...`, {
                  id: "bulk-delete",
                });

                // Use the optimized bulk delete mutation
                bulkDeleteTests(selectedTests);
              }}
            >
              Delete All
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          maxWidth: "400px",
        },
      }
    );
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
      {
        search: debouncedSearchTerm,
        status: statusFilter,
        category: categoryFilter,
      },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
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

  // Archive test functionality
  const handleArchiveTest = (test) => {
    toast(
      (t) => (
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8l4 4 4-4m0 0l4-4 4 4M9 16l.01.01M15 16l.01.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Archive Test</p>
              <p className="text-sm text-gray-600">
                Are you sure you want to archive "{test.title}"?
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            Archived tests cannot be taken by students but can be unarchived
            later.
          </div>
          <div className="flex space-x-2 justify-end">
            <button
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
              onClick={() => {
                toast.dismiss(t.id);
                archiveTestMutation.mutate(test._id);
              }}
            >
              Archive
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          maxWidth: "400px",
        },
      }
    );
  };

  // Archive test mutation
  const archiveTestMutation = useMutation({
    mutationFn: async (testId) => {
      const response = await fetch(`/api/tests/${testId}/archive`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to archive test");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Test archived successfully!");
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to archive test");
    },
  });

  // Unarchive test mutation
  const unarchiveTestMutation = useMutation({
    mutationFn: async (testId) => {
      const response = await fetch(`/api/tests/${testId}/unarchive`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to unarchive test");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Test unarchived successfully! Status set to draft.");
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unarchive test");
    },
  });

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

  // Export tests to Word document
  const handleExportTests = async () => {
    if (selectedTests.length === 0) {
      toast.error("Please select tests to export");
      return;
    }

    try {
      toast.loading("Preparing export...", { id: "export-tests" });

      // Fetch detailed test data with questions
      const exportPromises = selectedTests.map(async (testId) => {
        const response = await fetch(`/api/tests/${testId}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error(`Failed to fetch test ${testId}`);
        return response.json();
      });

      const testsData = await Promise.all(exportPromises);

      // Import docx library dynamically
      const {
        Document,
        Packer,
        Paragraph,
        TextRun,
        HeadingLevel,
        AlignmentType,
        BorderStyle,
        Table,
        TableRow,
        TableCell,
        WidthType,
        Header,
        Footer,
        PageNumber,
        NumberFormat,
      } = await import("docx");

      // Create Word document with professional styling
      const doc = new Document({
        styles: {
          paragraphStyles: [
            {
              id: "testTitle",
              name: "Test Title",
              basedOn: "Normal",
              next: "Normal",
              run: {
                size: 28,
                bold: true,
                font: "Times New Roman",
              },
              paragraph: {
                spacing: { before: 240, after: 120 },
                alignment: AlignmentType.CENTER,
              },
            },
            {
              id: "questionText",
              name: "Question Text",
              basedOn: "Normal",
              run: {
                size: 24,
                font: "Times New Roman",
              },
              paragraph: {
                spacing: { before: 120, after: 60 },
              },
            },
            {
              id: "optionText",
              name: "Option Text",
              basedOn: "Normal",
              run: {
                size: 22,
                font: "Times New Roman",
              },
              paragraph: {
                spacing: { after: 40 },
                indent: { left: 360 },
              },
            },
          ],
        },
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1440, // 1 inch
                  right: 1440, // 1 inch
                  bottom: 1440, // 1 inch
                  left: 1440, // 1 inch
                },
              },
            },
            headers: {
              default: new Header({
                children: [
                  // Header table with professional format
                  new Table({
                    rows: [
                      // First row: TEST, RATTRAPAGE, EXAMEN
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "TEST",
                                    bold: true,
                                    size: 24,
                                    font: "Times New Roman",
                                  }),
                                ],
                                alignment: AlignmentType.CENTER,
                              }),
                            ],
                            width: { size: 33, type: WidthType.PERCENTAGE },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "RATTRAPAGE",
                                    bold: true,
                                    size: 24,
                                    font: "Times New Roman",
                                  }),
                                ],
                                alignment: AlignmentType.CENTER,
                              }),
                            ],
                            width: { size: 34, type: WidthType.PERCENTAGE },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "EXAMEN",
                                    bold: true,
                                    size: 24,
                                    font: "Times New Roman",
                                  }),
                                ],
                                alignment: AlignmentType.CENTER,
                              }),
                            ],
                            width: { size: 33, type: WidthType.PERCENTAGE },
                          }),
                        ],
                      }),
                      // Second row: Date, Duration, Pages
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: `DATE : ${new Date().toLocaleDateString(
                                      "fr-FR"
                                    )}`,
                                    size: 20,
                                    font: "Times New Roman",
                                  }),
                                ],
                                alignment: AlignmentType.CENTER,
                              }),
                            ],
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: `DUREE : ${Math.ceil(
                                      testsData.reduce(
                                        (max, testData) =>
                                          Math.max(max, testData.data.duration),
                                        0
                                      ) / 60
                                    )
                                      .toString()
                                      .padStart(2, "0")}HEURE`,
                                    size: 20,
                                    font: "Times New Roman",
                                  }),
                                ],
                                alignment: AlignmentType.CENTER,
                              }),
                            ],
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: `Nbre PAGE : ${Math.max(
                                      1,
                                      Math.ceil(
                                        testsData.reduce(
                                          (total, testData) =>
                                            total +
                                            testData.data.questions.length,
                                          0
                                        ) / 10
                                      )
                                    )
                                      .toString()
                                      .padStart(2, "0")}`,
                                    size: 20,
                                    font: "Times New Roman",
                                  }),
                                ],
                                alignment: AlignmentType.CENTER,
                              }),
                            ],
                          }),
                        ],
                      }),
                      // Third row: Sector information
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "SECTEUR :    ELECT              CM              STAGE   2ième BTP M.M.S.I",
                                    size: 18,
                                    font: "Times New Roman",
                                  }),
                                ],
                                alignment: AlignmentType.LEFT,
                              }),
                            ],
                            columnSpan: 3,
                          }),
                        ],
                      }),
                      // Fourth row: Subject
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: `MATIERE : ${testsData
                                      .map((testData) => testData.data.category)
                                      .join(", ")
                                      .toUpperCase()}`,
                                    size: 18,
                                    font: "Times New Roman",
                                    bold: true,
                                  }),
                                ],
                                alignment: AlignmentType.LEFT,
                              }),
                            ],
                            columnSpan: 3,
                          }),
                        ],
                      }),
                      // Fifth row: Document authorization
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "DOCUMENT AUTORISE : OUI            NON",
                                    size: 18,
                                    font: "Times New Roman",
                                  }),
                                ],
                                alignment: AlignmentType.LEFT,
                              }),
                            ],
                            columnSpan: 3,
                          }),
                        ],
                      }),
                      // Sixth row: Signatures
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "FORMATEUR",
                                    size: 16,
                                    font: "Times New Roman",
                                    bold: true,
                                  }),
                                ],
                                alignment: AlignmentType.CENTER,
                              }),
                            ],
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "CHEF SECTEUR",
                                    size: 16,
                                    font: "Times New Roman",
                                    bold: true,
                                  }),
                                ],
                                alignment: AlignmentType.CENTER,
                              }),
                            ],
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "RCOE",
                                    size: 16,
                                    font: "Times New Roman",
                                    bold: true,
                                  }),
                                ],
                                alignment: AlignmentType.CENTER,
                              }),
                            ],
                          }),
                        ],
                      }),
                      // Seventh row: Names
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "A/M SALHI",
                                    size: 16,
                                    font: "Times New Roman",
                                  }),
                                ],
                                alignment: AlignmentType.CENTER,
                              }),
                            ],
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "",
                                    size: 16,
                                    font: "Times New Roman",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "CHEF DU CENTRE",
                                    size: 16,
                                    font: "Times New Roman",
                                    bold: true,
                                  }),
                                ],
                                alignment: AlignmentType.CENTER,
                              }),
                            ],
                          }),
                        ],
                      }),
                      // Student info row
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "NOM ………………………………………………….	PRENOM………….……………………..…………….	NOTE  ……... /20",
                                    size: 16,
                                    font: "Times New Roman",
                                  }),
                                ],
                                alignment: AlignmentType.LEFT,
                              }),
                            ],
                            columnSpan: 3,
                          }),
                        ],
                      }),
                    ],
                    width: { size: 100, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
            },
            footers: {
              default: new Footer({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Page ",
                        font: "Times New Roman",
                        size: 20,
                      }),
                      new TextRun({
                        children: [PageNumber.CURRENT],
                        font: "Times New Roman",
                        size: 20,
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
              }),
            },
            children: [
              // Tests content - Start directly with questions since header has all info
              ...testsData.flatMap((testData, index) => {
                const test = testData.data;
                return [
                  // Instructions section (if any test has instructions)
                  ...(test.instructions
                    ? [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "INSTRUCTIONS:",
                              bold: true,
                              font: "Times New Roman",
                              size: 24,
                            }),
                          ],
                          spacing: { before: 240, after: 120 },
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: test.instructions,
                              font: "Times New Roman",
                              size: 22,
                            }),
                          ],
                          spacing: { after: 240 },
                        }),
                      ]
                    : []),
                  // Questions section
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "QUESTIONS:",
                        bold: true,
                        font: "Times New Roman",
                        size: 26,
                      }),
                    ],
                    spacing: { before: 360, after: 240 },
                    alignment: AlignmentType.LEFT,
                  }),

                  // Questions with professional formatting
                  ...test.questions.flatMap((question, qIndex) => [
                    // Question number and text
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${qIndex + 1}. `,
                          bold: true,
                          font: "Times New Roman",
                          size: 24,
                        }),
                        new TextRun({
                          text: question.question,
                          font: "Times New Roman",
                          size: 24,
                        }),
                      ],
                      style: "questionText",
                      spacing: { before: 240, after: 120 },
                    }),

                    // Answer options with proper formatting
                    ...question.options.map((option, oIndex) => {
                      const optionLetter = String.fromCharCode(97 + oIndex); // a, b, c, d
                      return new Paragraph({
                        children: [
                          new TextRun({
                            text: `${optionLetter}) `,
                            bold: true,
                            font: "Times New Roman",
                            size: 22,
                          }),
                          new TextRun({
                            text: option.text,
                            font: "Times New Roman",
                            size: 22,
                            bold: option.isCorrect,
                            underline: option.isCorrect ? {} : undefined,
                          }),
                        ],
                        style: "optionText",
                        spacing: { after: 80 },
                      });
                    }),

                    // Add space after each question
                    new Paragraph({
                      children: [new TextRun({ text: "" })],
                      spacing: { after: 120 },
                    }),
                  ]),

                  // Page break between tests (except last)
                  ...(index < testsData.length - 1
                    ? [
                        new Paragraph({
                          children: [new TextRun({ text: "", break: 1 })],
                          pageBreakBefore: true,
                        }),
                      ]
                    : []),
                ];
              }),
            ],
          },
        ],
      });

      // Generate and download
      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tests-export-${
        new Date().toISOString().split("T")[0]
      }.docx`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss("export-tests");
      toast.success(
        `🎉 ${selectedTests.length} test(s) exported successfully!`
      );
    } catch (error) {
      toast.dismiss("export-tests");
      toast.error("Failed to export tests: " + error.message);
      console.error("Export error:", error);
    }
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
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleExportTests}
              disabled={selectedTests.length === 0}
            >
              <Download size={16} />
              Export Test
            </Button>
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
                  variant="outline"
                  size="sm"
                  onClick={handleExportTests}
                  disabled={selectedTests.length === 0}
                >
                  <Download size={14} className="mr-1" />
                  Export Selected
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isDeleting || isBulkDeleting}
                >
                  <Trash2 size={14} className="mr-1" />
                  {isBulkDeleting ? "Deleting..." : "Delete Selected"}
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
                {searchTerm !== debouncedSearchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
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
                <SelectItem value="Test">Test</SelectItem>
                <SelectItem value="Exam">Exam</SelectItem>
                <SelectItem value="Rattrapage">Rattrapage</SelectItem>
                <SelectItem value="Exercice">Exercice</SelectItem>
                <SelectItem value="Quiz">Quiz</SelectItem>
                <SelectItem value="Pré-Test">Pré-Test</SelectItem>
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
                          {test.status === "archived" ? (
                            <DropdownMenuItem
                              onClick={() =>
                                unarchiveTestMutation.mutate(test._id)
                              }
                              className="text-blue-600 focus:text-blue-600"
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Unarchive Test
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleArchiveTest(test)}
                              className="text-orange-600 focus:text-orange-600"
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Archive Test
                            </DropdownMenuItem>
                          )}
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
                        {test.status === "archived" ? (
                          <div className="flex-1 text-center py-2">
                            <span className="text-sm text-gray-500 italic">
                              Test is archived and not available
                            </span>
                          </div>
                        ) : (
                          <Link
                            to={`/tests/${test._id}/take`}
                            className="flex-1"
                          >
                            <Button
                              className="w-full"
                              disabled={test.status !== "published"}
                            >
                              <Play size={14} className="mr-1" />
                              Take Test
                            </Button>
                          </Link>
                        )}
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
