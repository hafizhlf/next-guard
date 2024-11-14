"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export default function ServerManagementSkeleton() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <Skeleton className="w-full h-6" />
          <Skeleton className="w-3/4 h-4 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Skeleton className="w-1/2 h-8" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>
                  <Skeleton className="w-1/3 h-6" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-1/3 h-6" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-1/3 h-6" />
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Skeleton className="w-full h-6" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-full h-6" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-full h-6" />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Skeleton className="w-full h-6" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-full h-6" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-full h-6" />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Skeleton className="w-full h-6" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-full h-6" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-full h-6" />
                </TableCell>
              </TableRow>

            </TableBody>
          </Table>

        </CardContent>
      </Card>
    </div>
  )
}
