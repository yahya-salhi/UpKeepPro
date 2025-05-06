import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function HistoryTable({ data }) {
  // Final deduplication safeguard
  const uniqueData = data.filter(
    (item, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t._id === item._id ||
          (t.reference === item.reference && t.date === item.date)
      )
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-muted/50 font-medium">Date</TableHead>
            <TableHead className="bg-muted/50 font-medium">Action</TableHead>
            <TableHead className="bg-muted/50 font-medium">Reference</TableHead>
            <TableHead className="bg-muted/50 font-medium">Impact</TableHead>
            <TableHead className="bg-muted/50 font-medium">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {uniqueData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No transaction history available.
              </TableCell>
            </TableRow>
          ) : (
            uniqueData.map((transaction, index) => (
              <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">
                  {new Date(transaction.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      transaction.eventType === "entry"
                        ? "success"
                        : transaction.eventType === "exit"
                        ? "destructive"
                        : "outline"
                    }
                    className="capitalize"
                  >
                    {transaction.eventType}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.reference}</TableCell>
                <TableCell>
                  {transaction.qteChange ? (
                    <div className="flex items-center font-medium">
                      {transaction.eventType === "exit" ? (
                        <>
                          <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-red-600">-{transaction.qteChange}</span>
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-green-600">+{transaction.qteChange}</span>
                        </>
                      )}
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {transaction.notes || "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
