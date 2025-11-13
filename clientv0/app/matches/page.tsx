"use client"

import { useState } from "react"
import { Activity, Calendar, Filter, RefreshCw, Search, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function MatchesPage() {
  const [selectedView, setSelectedView] = useState<"today" | "tomorrow">("today")
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null)

  const leagues = ["Premier League", "La Liga", "Bundesliga", "Serie A", "Ligue 1", "Champions League"]

  const matches = [
    {
      id: 1,
      home: "Manchester City",
      homeCode: "MCI",
      away: "Liverpool",
      awayCode: "LIV",
      league: "Premier League",
      time: "18:00",
      status: "Upcoming",
      confidence: 94,
    },
    {
      id: 2,
      home: "Arsenal",
      homeCode: "ARS",
      away: "Chelsea",
      awayCode: "CHE",
      league: "Premier League",
      time: "15:30",
      status: "Live",
      score: "1-1",
      confidence: 82,
    },
    {
      id: 3,
      home: "Real Madrid",
      homeCode: "RMA",
      away: "Barcelona",
      awayCode: "BAR",
      league: "La Liga",
      time: "20:00",
      status: "Upcoming",
      confidence: 89,
    },
    {
      id: 4,
      home: "Bayern Munich",
      homeCode: "BAY",
      away: "Dortmund",
      awayCode: "DOR",
      league: "Bundesliga",
      time: "17:30",
      status: "Upcoming",
      confidence: 87,
    },
    {
      id: 5,
      home: "Juventus",
      homeCode: "JUV",
      away: "Inter Milan",
      awayCode: "INT",
      league: "Serie A",
      time: "19:45",
      status: "Upcoming",
      confidence: 78,
    },
    {
      id: 6,
      home: "PSG",
      homeCode: "PSG",
      away: "Marseille",
      awayCode: "MAR",
      league: "Ligue 1",
      time: "20:45",
      status: "Upcoming",
      confidence: 91,
    },
    {
      id: 7,
      home: "Atletico Madrid",
      homeCode: "ATM",
      away: "Valencia",
      awayCode: "VAL",
      league: "La Liga",
      time: "21:00",
      status: "Upcoming",
      confidence: 76,
    },
    {
      id: 8,
      home: "AC Milan",
      homeCode: "MIL",
      away: "Napoli",
      awayCode: "NAP",
      league: "Serie A",
      time: "18:30",
      status: "Upcoming",
      confidence: 84,
    },
  ]

  const filteredMatches = selectedLeague ? matches.filter((m) => m.league === selectedLeague) : matches

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">GoalBlip</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link href="/matches" className="text-sm font-medium text-primary">
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

      {/* Page Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Match Browser</h1>
              <p className="text-muted-foreground">171 matches available • Last updated 2 minutes ago</p>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search teams or leagues..." className="pl-9" />
              </div>
            </div>

            {/* View Toggle */}
            <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)} className="w-auto">
              <TabsList>
                <TabsTrigger value="today" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Today
                </TabsTrigger>
                <TabsTrigger value="tomorrow" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Tomorrow
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Filter Button */}
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* League Chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={selectedLeague === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLeague(null)}
            >
              All Leagues
            </Button>
            {leagues.map((league) => (
              <Button
                key={league}
                variant={selectedLeague === league ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLeague(league)}
              >
                {league}
              </Button>
            ))}
          </div>

          {/* League hub CTA */}
          <Card className="mt-4 border-dashed border-border/70 bg-muted/30">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Need league-level intel?</p>
                <p className="text-sm text-muted-foreground">
                  Explore coverage, confidence, and spotlight stories inside the dedicated League Hub.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/leagues">Open League Hub</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Matches List */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredMatches.map((match) => (
            <Card key={match.id} className="hover:border-primary/50 transition-all cursor-pointer group">
              <CardContent className="p-0">
                <Link href={`/match/${match.id}`} className="block">
                  {/* Match Header */}
                  <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-normal">
                        {match.league}
                      </Badge>
                      {match.status === "Live" && (
                        <Badge variant="destructive" className="text-xs animate-pulse">
                          Live
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{match.time}</span>
                    </div>
                  </div>

                  {/* Match Details */}
                  <div className="p-4">
                    {/* Teams */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                            {match.homeCode}
                          </div>
                          <span className="font-medium">{match.home}</span>
                        </div>
                        {match.score && <span className="text-2xl font-bold">{match.score.split("-")[0]}</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                            {match.awayCode}
                          </div>
                          <span className="font-medium">{match.away}</span>
                        </div>
                        {match.score && <span className="text-2xl font-bold">{match.score.split("-")[1]}</span>}
                      </div>
                    </div>

                    {/* Prediction Info */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">AI Confidence</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-success rounded-full transition-all"
                            style={{ width: `${match.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-success min-w-[3ch]">{match.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg">
            Load More Matches
          </Button>
          <p className="text-sm text-muted-foreground mt-4">Showing 8 of 171 matches</p>
        </div>
      </div>
    </div>
  )
}
