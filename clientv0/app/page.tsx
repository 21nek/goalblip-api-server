import { Activity, TrendingUp, Target, Clock, BarChart3, Trophy, Globe2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const featuredLeagues = [
  {
    name: "Premier League",
    matches: 12,
    confidence: 88,
    note: "Title race intensity",
  },
  {
    name: "La Liga",
    matches: 9,
    confidence: 84,
    note: "El Clásico week",
  },
  {
    name: "Champions League",
    matches: 4,
    confidence: 90,
    note: "Knockout stage",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">GoalBlip</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-primary">
              Dashboard
            </Link>
            <Link
              href="/matches"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Matches
            </Link>
            <Link
              href="/leagues"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Leagues
            </Link>
          </nav>
          <Button size="sm">Sign In</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl">
          <Badge variant="secondary" className="mb-4">
            AI-Powered Analytics
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance leading-tight">
            Advanced Football Intelligence
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">
            Real-time predictions, odds analysis, and match insights powered by machine learning algorithms.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/matches">Browse Matches</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/match/1">View Analysis</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Today's Matches</CardDescription>
              <CardTitle className="text-4xl font-bold">171</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                <span>+12 from yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Prediction Accuracy</CardDescription>
              <CardTitle className="text-4xl font-bold">87%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                <span>Last 30 days</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Leagues</CardDescription>
              <CardTitle className="text-4xl font-bold">24</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span>Worldwide coverage</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Last Updated</CardDescription>
              <CardTitle className="text-4xl font-bold">2m</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Auto-refresh active</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Charts Placeholder Section */}
      <section className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Match Volume Trend</CardTitle>
              <CardDescription>Daily fixture counts over the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed border-border">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Chart visualization placeholder</p>
                  <p className="text-xs text-muted-foreground mt-1">Connect to /api/matches for live data</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prediction Confidence Distribution</CardTitle>
              <CardDescription>Success rates by confidence level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed border-border">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Chart visualization placeholder</p>
                  <p className="text-xs text-muted-foreground mt-1">Wire to prediction accuracy metrics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* League Coverage */}
      <section className="container mx-auto px-4 pb-12">
        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <Globe2 className="h-4 w-4 text-primary" />
                <span>League focus</span>
              </div>
              <CardTitle className="text-2xl mt-2">Global Coverage Snapshot</CardTitle>
              <CardDescription>Tap into dedicated league intelligence sourced from /api/matches views.</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/leagues">Go to League Hub</Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {featuredLeagues.map((league) => (
              <div key={league.name} className="rounded-2xl border bg-muted/30 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-lg font-semibold">{league.name}</p>
                  <Badge variant="outline">{league.matches} matches</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{league.note}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Confidence</p>
                    <p className="text-3xl font-bold text-success">{league.confidence}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Source</p>
                    <p className="text-sm font-medium">Highlight predictions</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Top Predictions Preview */}
      <section className="container mx-auto px-4 pb-12">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Predictions Today</CardTitle>
                <CardDescription>Highest confidence matches with best odds value</CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href="/matches">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { home: "Manchester City", away: "Liverpool", league: "Premier League", confidence: 94, pick: "1X" },
                { home: "Real Madrid", away: "Barcelona", league: "La Liga", confidence: 89, pick: "BTTS" },
                { home: "Bayern Munich", away: "Dortmund", league: "Bundesliga", confidence: 87, pick: "O2.5" },
              ].map((match, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {match.league}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Today, 18:00</span>
                    </div>
                    <p className="font-medium text-sm">
                      {match.home} vs {match.away}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Pick</p>
                      <Badge className="font-mono">{match.pick}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                      <p className="text-lg font-bold text-success">{match.confidence}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
