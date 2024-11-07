import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function RegisterSkeleton() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Skeleton for the Tabs Header */}
      <div className="mb-4 flex space-x-4">
        <Skeleton className="w-24 h-6" />
        <Skeleton className="w-24 h-6" />
      </div>

      {/* Skeleton for the Select Dropdown */}
      <div className="float-right mb-4">
        <Skeleton className="w-[200px] h-8" />
      </div>

      {/* Skeleton for Clients Table */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="w-1/2 h-6" />
            <Skeleton className="w-1/3 h-4 mt-1" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>
                    <div className="w-24 h-6">
                      <Skeleton />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-24 h-6">
                      <Skeleton />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-24 h-6">
                      <Skeleton />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-24 h-6">
                      <Skeleton />
                    </div>
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="w-24 h-6">
                      <Skeleton />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-24 h-6">
                      <Skeleton />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-24 h-6">
                      <Skeleton />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-24 h-6">
                      <Skeleton />
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <form className="mt-4 flex items-end gap-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Skeleton className="w-1/2 h-6" />
                <Skeleton className="w-full h-8" />
              </div>
              <Skeleton className="w-24 h-8 mt-4" />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
