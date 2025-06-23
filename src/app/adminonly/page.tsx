// src/app/adminonly/page.tsx
'use client';

import useAdminRoute from '@/hooks/useAdminRoute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2 } from "lucide-react";
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';

interface UserData {
    id: string;
    email: string;
    role: 'admin' | 'user';
    createdAt: any;
}

interface DashboardStats {
    totalUsers: number;
}

export default function AdminDashboardPage() {
  const { user, loading, role } = useAdminRoute();
  const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0 });
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        if (role === 'admin') {
            try {
                const usersCollectionRef = collection(db, 'users');
                const usersSnapshot = await getDocs(usersCollectionRef);

                const usersList = usersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as UserData));

                setUsers(usersList);
                setStats({ totalUsers: usersList.length });

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
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-headline font-semibold text-foreground">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-body">Total Users</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-headline">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground pt-1 font-body">Total registered users in the system.</p>
            </CardContent>
        </Card>
        {/* More metric cards can be added here */}
      </div>

      <Card className="shadow-lg">
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
