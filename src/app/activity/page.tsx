'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { format } from 'date-fns';

interface UserActivity {
  id: string;
  type: string;
  tool: string;
  timestamp: any;
  resultsSummary?: string;
}

export default function ActivityPage() {
  const { user, loading: authLoading } = useProtectedRoute();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (user) {
        setLoadingData(true);
        const activitiesRef = collection(db, "users", user.uid, "activities");
        const q = query(activitiesRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedActivities = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserActivity));
        setActivities(fetchedActivities);
        setLoadingData(false);
      }
    };

    if (!authLoading) {
      fetchActivities();
    }
  }, [user, authLoading]);

  if (authLoading || loadingData) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-headline font-semibold text-foreground">Your Activity</h1>
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>A complete history of all your actions on RankPilot.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Tool</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      {activity.timestamp ? format(activity.timestamp.toDate(), 'PPpp') : 'N/A'}
                    </TableCell>
                    <TableCell>{activity.tool}</TableCell>
                    <TableCell className="capitalize">{activity.type.replace(/_/g, ' ')}</TableCell>
                    <TableCell className="truncate max-w-sm">{activity.resultsSummary ?? 'N/A'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    You have no activity yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
