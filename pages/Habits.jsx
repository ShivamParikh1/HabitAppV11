import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { UserHabit } from "@/entities/UserHabit";
import { Habit } from "@/entities/Habit";
import { HabitLog } from "@/entities/HabitLog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  RotateCcw, 
  Trash2, 
  Settings, 
  Plus, 
  Target,
  Calendar,
  Flame,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Habits() {
  const [userHabits, setUserHabits] = useState([]);
  const [habits, setHabits] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, userHabitData, habitData] = await Promise.all([
        User.me(),
        UserHabit.filter({ status: "active" }),
        Habit.list()
      ]);
      
      setUser(userData);
      
      // Filter user habits for current user
      const myHabits = userHabitData.filter(uh => uh.user_id === userData.id);
      setUserHabits(myHabits);
      setHabits(habitData);
      
      // Load today's logs
      const today = format(new Date(), "yyyy-MM-dd");
      const logs = await HabitLog.filter({ date: today });
      setTodayLogs(logs);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleComplete = async (userHabit) => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const existingLog = todayLogs.find(log => log.user_habit_id === userHabit.id);
      
      if (existingLog) {
        // Update existing log
        await HabitLog.update(existingLog.id, { completed: true });
      } else {
        // Create new log
        await HabitLog.create({
          user_habit_id: userHabit.id,
          date: today,
          completed: true
        });
      }
      
      // Update streak
      const newStreak = (userHabit.streak_current || 0) + 1;
      await UserHabit.update(userHabit.id, {
        streak_current: newStreak,
        streak_longest: Math.max(newStreak, userHabit.streak_longest || 0),
        total_completions: (userHabit.total_completions || 0) + 1
      });
      
      loadData();
    } catch (error) {
      console.error("Error completing habit:", error);
    }
  };

  const handleUndo = async (userHabit) => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const existingLog = todayLogs.find(log => log.user_habit_id === userHabit.id);
      
      if (existingLog) {
        await HabitLog.update(existingLog.id, { completed: false });
        
        // Update streak
        const newStreak = Math.max(0, (userHabit.streak_current || 0) - 1);
        await UserHabit.update(userHabit.id, {
          streak_current: newStreak,
          total_completions: Math.max(0, (userHabit.total_completions || 0) - 1)
        });
      }
      
      loadData();
    } catch (error) {
      console.error("Error undoing habit:", error);
    }
  };

  const handleDelete = async (userHabit) => {
    try {
      await UserHabit.delete(userHabit.id);
      loadData();
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  const getHabitDetails = (habitId) => {
    return habits.find(h => h.id === habitId);
  };

  const isCompletedToday = (userHabitId) => {
    const log = todayLogs.find(log => log.user_habit_id === userHabitId);
    return log?.completed || false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Habits</h1>
          <p className="text-gray-600 mt-1">
            Track your progress and build consistency
          </p>
        </div>
        <Link to={createPageUrl("Home")}>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Habit
          </Button>
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Habits</p>
                <p className="text-2xl font-bold text-gray-900">{userHabits.length}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todayLogs.filter(log => log.completed).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Longest Streak</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...userHabits.map(h => h.streak_longest || 0), 0)}
                </p>
              </div>
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Habits List */}
      <div className="space-y-4">
        {userHabits.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No habits yet</h3>
            <p className="text-gray-600 mb-6">Start building better habits today!</p>
            <Link to={createPageUrl("Home")}>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Habit
              </Button>
            </Link>
          </div>
        ) : (
          userHabits.map((userHabit, index) => {
            const habitDetails = getHabitDetails(userHabit.habit_id);
            const completedToday = isCompletedToday(userHabit.id);
            
            return (
              <motion.div
                key={userHabit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`transition-all duration-300 ${
                  completedToday 
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" 
                    : "hover:shadow-lg"
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          habitDetails?.type === "build" 
                            ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                            : "bg-gradient-to-r from-red-500 to-pink-500"
                        }`}>
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {habitDetails?.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge variant="secondary">
                              {habitDetails?.category}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Flame className="w-4 h-4 text-orange-500" />
                              {userHabit.streak_current || 0} day streak
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <TrendingUp className="w-4 h-4 text-blue-500" />
                              {userHabit.total_completions || 0} total
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {completedToday ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUndo(userHabit)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Undo
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleComplete(userHabit)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Complete
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(userHabit)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
