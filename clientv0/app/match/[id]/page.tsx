"use client"

import {
  Activity,
  TrendingUp,
  Lock,
  Calendar,
  MapPin,
  Users,
  BarChart3,
  RefreshCw,
  Share2,
  ArrowLeft,
  TrendingDown,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function MatchDetailPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/matches">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold hidden sm:inline">GoalBlip</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Scoreboard */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center text-center mb-6">
            <Badge variant="outline" className="mb-3">
              Premier League • Matchday 15
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              <span>Etihad Stadium</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Today, 18:00 GMT</span>
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between gap-8">
              {/* Home Team */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-muted flex items-center justify-center text-2xl font-bold mb-3">
                  MCI
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-center">Manchester City</h2>
              </div>

              {/* Score */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-4">
                  <span className="text-5xl md:text-6xl font-bold">2</span>
                  <span className="text-3xl md:text-4xl text-muted-foreground">-</span>
                  <span className="text-5xl md:text-6xl font-bold">1</span>
                </div>
                <Badge variant="destructive" className="animate-pulse">
                  Live • 67'
                </Badge>
                <span className="text-xs text-muted-foreground">(HT: 1-0)</span>
              </div>

              {/* Away Team */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-muted flex items-center justify-center text-2xl font-bold mb-3">
                  LIV
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-center">Liverpool</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Highlight Predictions */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold mb-4">Highlight Predictions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Match Winner", pick: "1", rating: 4.5, success: 94, locked: false },
              { title: "Both Teams Score", pick: "Yes", rating: 4.2, success: 89, locked: false },
              { title: "Total Goals", pick: "Over 2.5", rating: 4.8, success: 92, locked: true },
            ].map((pred, i) => (
              <Card key={i} className={pred.locked ? "border-muted-foreground/50" : "border-primary/50 bg-primary/5"}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <CardDescription className="text-xs">{pred.title}</CardDescription>
                    {pred.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  <CardTitle className="text-2xl">{pred.pick}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Success Rate</span>
                      <span className="font-bold text-success">{pred.success}%</span>
                    </div>
                    <Progress value={pred.success} className="h-2" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`w-3 h-3 ${i < Math.floor(pred.rating) ? "bg-primary" : "bg-muted"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-1">Rating {pred.rating}/5</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Detailed Analysis Tabs */}
        <section className="mb-8">
          <Tabs defaultValue="predictions" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="predictions">Detailed Predictions</TabsTrigger>
              <TabsTrigger value="odds">Odds Trends</TabsTrigger>
              <TabsTrigger value="form">Team Form</TabsTrigger>
            </TabsList>

            <TabsContent value="predictions" className="mt-6">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Outcome Probabilities</CardTitle>
                    <CardDescription>AI-calculated confidence levels for match outcomes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { outcome: "Home Win", confidence: 68, color: "bg-chart-1" },
                      { outcome: "Draw", confidence: 22, color: "bg-chart-2" },
                      { outcome: "Away Win", confidence: 10, color: "bg-chart-3" },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{item.outcome}</span>
                          <span className="text-sm font-bold">{item.confidence}%</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} transition-all`}
                            style={{ width: `${item.confidence}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Goals Prediction</CardTitle>
                    <CardDescription>Expected goals and scoring patterns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Expected Total Goals</span>
                        <span className="text-2xl font-bold">2.8</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Home xG</p>
                          <p className="text-xl font-bold">1.7</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Away xG</p>
                          <p className="text-xl font-bold">1.1</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="odds" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Odds Movement Analysis</CardTitle>
                  <CardDescription>Real-time odds trends from multiple bookmakers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed border-border">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Odds trend visualization placeholder</p>
                      <p className="text-xs text-muted-foreground mt-1">Connect to oddsTrends data from API</p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {[
                      { label: "Home", current: "1.85", change: -0.15, trend: "down" },
                      { label: "Draw", current: "3.50", change: 0.05, trend: "up" },
                      { label: "Away", current: "4.20", change: 0.3, trend: "up" },
                    ].map((odd, i) => (
                      <div key={i} className="text-center p-4 border border-border rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">{odd.label}</p>
                        <p className="text-2xl font-bold mb-1">{odd.current}</p>
                        <div
                          className={`flex items-center justify-center gap-1 text-xs ${odd.trend === "down" ? "text-success" : "text-destructive"}`}
                        >
                          {odd.trend === "down" ? (
                            <TrendingDown className="h-3 w-3" />
                          ) : (
                            <TrendingUp className="h-3 w-3" />
                          )}
                          <span>{Math.abs(odd.change)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="form" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Manchester City - Recent Form</CardTitle>
                    <CardDescription>Last 5 matches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { opponent: "Chelsea", result: "W", score: "3-1", role: "Home" },
                        { opponent: "Arsenal", result: "W", score: "2-1", role: "Away" },
                        { opponent: "Tottenham", result: "D", score: "1-1", role: "Home" },
                        { opponent: "Newcastle", result: "W", score: "4-0", role: "Away" },
                        { opponent: "Brighton", result: "W", score: "2-0", role: "Home" },
                      ].map((match, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={
                                match.result === "W" ? "default" : match.result === "D" ? "secondary" : "destructive"
                              }
                              className="w-8 h-8 flex items-center justify-center p-0"
                            >
                              {match.result}
                            </Badge>
                            <div>
                              <p className="font-medium text-sm">vs {match.opponent}</p>
                              <p className="text-xs text-muted-foreground">{match.role}</p>
                            </div>
                          </div>
                          <span className="font-mono text-sm">{match.score}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Liverpool - Recent Form</CardTitle>
                    <CardDescription>Last 5 matches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { opponent: "Man United", result: "W", score: "3-0", role: "Away" },
                        { opponent: "Everton", result: "D", score: "2-2", role: "Home" },
                        { opponent: "West Ham", result: "W", score: "1-0", role: "Away" },
                        { opponent: "Aston Villa", result: "L", score: "1-2", role: "Home" },
                        { opponent: "Fulham", result: "W", score: "3-1", role: "Away" },
                      ].map((match, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={
                                match.result === "W" ? "default" : match.result === "D" ? "secondary" : "destructive"
                              }
                              className="w-8 h-8 flex items-center justify-center p-0"
                            >
                              {match.result}
                            </Badge>
                            <div>
                              <p className="font-medium text-sm">vs {match.opponent}</p>
                              <p className="text-xs text-muted-foreground">{match.role}</p>
                            </div>
                          </div>
                          <span className="font-mono text-sm">{match.score}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Upcoming Matches */}
        <section>
          <h3 className="text-2xl font-bold mb-4">Upcoming Fixtures</h3>
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Manchester City Next</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { opponent: "Newcastle", date: "Dec 18", competition: "Premier League" },
                    { opponent: "Aston Villa", date: "Dec 21", competition: "Premier League" },
                  ].map((match, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">vs {match.opponent}</p>
                        <p className="text-xs text-muted-foreground">{match.competition}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{match.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Liverpool Next</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { opponent: "Tottenham", date: "Dec 17", competition: "Premier League" },
                    { opponent: "Leicester", date: "Dec 22", competition: "Premier League" },
                  ].map((match, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">vs {match.opponent}</p>
                        <p className="text-xs text-muted-foreground">{match.competition}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{match.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Metadata Footer */}
        <div className="mt-12 p-6 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Data updated 2 minutes ago • Prediction model v4.2 • ID: match_12345</span>
          </div>
        </div>
      </div>
    </div>
  )
}
