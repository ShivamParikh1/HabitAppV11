import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useApp } from "@/context/AppContext";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import { format, parseISO, isToday } from 'date-fns';

const questions = [
    { key: 'went_well', prompt: "What went well today?" },
    { key: 'went_better', prompt: "What could have gone better?" },
    { key: 'learned', prompt: "What did I learn today?" },
    { key: 'felt', prompt: "How did I feel overall?" }
];

export default function UnpackDay() {
    const { state, dispatch } = useApp();
    const { dailyReflections } = state;
    
    const [currentReflection, setCurrentReflection] = useState({ answers: {} });
    const [selectedDate, setSelectedDate] = useState(new Date()); 

    const hasTodayReflection = dailyReflections.some(r => r.date === format(new Date(), 'yyyy-MM-dd'));

    const handleAnswerChange = (key, value) => {
        setCurrentReflection(prev => ({
            ...prev,
            answers: { ...prev.answers, [key]: value }
        }));
    };

    const handleSave = () => {
        const reflectionToSave = {
            date: format(new Date(), 'yyyy-MM-dd'),
            answers: currentReflection.answers
        };
        
        dispatch({
          type: 'ADD_DAILY_REFLECTION',
          payload: reflectionToSave
        });
        
        setCurrentReflection({ answers: {} });
    };

    const displayedReflection = dailyReflections.find(r => r.date === format(selectedDate, 'yyyy-MM-dd'));

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to={createPageUrl("Features")}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Unpack My Day</h1>
                        <p className="text-gray-600 mt-1">Reflect on your day, find clarity, and plan for tomorrow.</p>
                    </div>
                </div>
                <Input 
                    type="date" 
                    value={format(selectedDate, 'yyyy-MM-dd')} 
                    onChange={(e) => setSelectedDate(parseISO(e.target.value))}
                    className="w-48"
                />
            </div>

            {isToday(selectedDate) && !hasTodayReflection ? (
                <Card>
                    <CardHeader><CardTitle>Today's Reflection</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        {questions.map(q => (
                            <div key={q.key}>
                                <Label className="text-lg">{q.prompt}</Label>
                                <Textarea 
                                    value={currentReflection.answers[q.key] || ''}
                                    onChange={e => handleAnswerChange(q.key, e.target.value)}
                                    className="mt-2"
                                />
                            </div>
                        ))}
                        <div className="text-right">
                            <Button onClick={handleSave}>Save Reflection</Button>
                        </div>
                    </CardContent>
                </Card>
            ) : displayedReflection ? (
                <Card>
                    <CardHeader><CardTitle>Reflection for {format(parseISO(displayedReflection.date), 'MMMM d, yyyy')}</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        {questions.map(q => (
                           <div key={q.key}>
                                <h3 className="font-semibold text-lg">{q.prompt}</h3>
                                <p className="text-gray-700 mt-1 p-4 bg-gray-50 rounded-md">{displayedReflection.answers[q.key] || 'No answer.'}</p>
                           </div>
                        ))}
                    </CardContent>
                </Card>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500">No reflection found for this date.</p>
                </div>
            )}
        </div>
    );
}