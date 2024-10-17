import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Loading() {
    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>

            <Tabs defaultValue="clients">
                <TabsList className="mb-4">
                    <TabsTrigger value="clients" disabled>
                        <Skeleton className="h-4 w-16" />
                    </TabsTrigger>
                    <TabsTrigger value="settings" disabled>
                        <Skeleton className="h-4 w-24" />
                    </TabsTrigger>
                </TabsList>

                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-10 w-48" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Tabs>

            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-10 w-24" />
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <Skeleton className="h-4 w-40 mb-1" />
                            <Skeleton className="h-3 w-56" />
                        </div>
                        <Skeleton className="h-6 w-12" />
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <Skeleton className="h-4 w-36 mb-1" />
                            <Skeleton className="h-3 w-52" />
                        </div>
                        <Skeleton className="h-10 w-48" />
                    </div>
                    <Skeleton className="h-10 w-40 mt-4" />
                </CardContent>
            </Card>
        </div>
    )
}