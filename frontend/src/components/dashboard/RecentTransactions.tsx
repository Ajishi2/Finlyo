import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRecords } from "@/api/records";

export function RecentTransactions() {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['recent-transactions', page],
    queryFn: () => getRecords({ page, size: 5 }), // Show 5 recent transactions
    placeholderData: (previousData) => previousData,
  });

  const records = (data as any)?.data?.data?.content || [];
  const totalPages = (data as any)?.data?.data?.totalPages || 1;
  const totalElements = (data as any)?.data?.data?.totalElements || 0;

  if (isLoading) {
    return (
      <Card className="rounded-lg border border-border shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="rounded-lg border border-border shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">Error loading transactions</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-lg border border-border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record: any) => (
              <TableRow key={record.id}>
                <TableCell className="text-muted-foreground">
                  {new Date(record.recordDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{record.category}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      record.type === "INCOME"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }
                  >
                    {record.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {record.type === "EXPENSE" ? "-" : "+"}${record.amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground">{record.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-gray-700">
              Showing {records.length} of {totalElements} transactions
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                disabled={page === 0}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-700">
                {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={page === totalPages - 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
