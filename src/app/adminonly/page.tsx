
// src/app/adminonly/page.tsx
'use client';

import useAdminRoute from '@/hooks/useAdminRoute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2, UserPlus, ActivitySquare } from "lucide-react";
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import LoadingScreen from '@/components/ui/loading-screen';

interface UserData {
    id: string;
    email: string;
    role: 'admin' | 'user';
    createdAt: any;
}

interface DashboardStats {
    totalUsers: number;
    recentSignups: number;
    totalActivities: number;
}

export default function AdminDashboardPage() {
  const { user, loading, role } = useAdminRoute();
  const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0, recentSignups: 0, totalActivities: 0 });
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        if (role === 'admin') {
            try {
                // Fetch users
                const usersCollectionRef = collection(db, 'users');
                const usersSnapshot = await getDocs(usersCollectionRef);
                const usersList = usersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as UserData));
                setUsers(usersList);
                
                // Calculate stats
                const totalUsers = usersList.length;

                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);

                const recentSignupsQuery = query(usersCollectionRef, where("createdAt", ">=", sevenDaysAgoTimestamp));
                const recentSignupsSnapshot = await getDocs(recentSignupsQuery);
                const recentSignups = recentSignupsSnapshot.size;
                
                let totalActivities = 0;
                // This is not scalable for many users, but fine for a prototype.
                // A better approach would be using a distributed counter.
                await Promise.all(usersList.map(async (u) => {
                    const activitiesSnapshot = await getDocs(collection(db, 'users', u.id, 'activities'));
                    totalActivities += activitiesSnapshot.size;
                }));

                setStats({ totalUsers, recentSignups, totalActivities });

            } catch (error) {
                console.error("Error fetching admin data:", error);
            } finally {
                setLoadingData(false);
            }
        }
    };

    if (!loading) {
        fetchData();
    }
  }, [loading, role]);


  if (loading || loadingData) {
    return <LoadingScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-headline font-semibold text-foreground">Admin Dashboard</h1>
      <p className="text-muted-foreground font-body">Monitor platform usage, manage users, and view key system metrics.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-body">Total Users</CardTitle>
              <Users className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-headline">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground pt-1 font-body">Total registered users in the system.</p>
            </CardContent>
        </Card>
        <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-body">Recent Signups</CardTitle>
              <UserPlus className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-headline">{stats.recentSignups}</div>
              <p className="text-xs text-muted-foreground pt-1 font-body">New users in the last 7 days.</p>
            </CardContent>
        </Card>
        <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-body">Total Activities</CardTitle>
              <ActivitySquare className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-headline">{stats.totalActivities}</div>
              <p className="text-xs text-muted-foreground pt-1 font-body">Total tool uses across all users.</p>
            </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
            <CardTitle className="font-headline">User Management</CardTitle>
            <CardDescription className="font-body">A list of all users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined On</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((u) => (
                        <TableRow key={u.id}>
                            <TableCell className="font-medium">{u.email}</TableCell>
                            <TableCell>
                                <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                                    {u.role}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {u.createdAt ? format(u.createdAt.toDate(), 'PPpp') : 'N/A'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
