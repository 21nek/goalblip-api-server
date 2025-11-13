"use client"

import { useState } from "react"
import { Activity, Globe2, MapPin, Shield, Trophy, Users, TrendingUp, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

const leagueData = [
  {
    name: "Premier League",
    country: "England",
    code: "ENG",
    matchesToday: 12,
    avgGoals: 3.1,
    successRate: 88,
    topForm: "Manchester City",
    spotlight: "Title race tightening",
  },
  {
    name: "La Liga",
    country: "Spain",
    code: "ESP",
    matchesToday: 9,
    avgGoals: 2.8,
    successRate: 84,
    topForm: "Barcelona",
    spotlight: "Derby weekend",
  },
  {
    name: "Bundesliga",
    country: "Germany",
    code: "GER",
    matchesToday: 7,
    avgGoals: 3.4,
    successRate: 81,
    topForm: "Bayer Leverkusen",
    spotlight: "High-scoring trend",
  },
  {
    name: "Serie A",
    country: "Italy",
    code: "ITA",
    matchesToday: 8,
    avgGoals: 2.5,
    successRate: 79,
    topForm: "Inter Milan",
    spotlight: "Defensive masterclass",
  },
  {
    name: "Ligue 1",
    country: "France",
    code: "FRA",
    matchesToday: 6,
    avgGoals: 3.0,
    successRate: 76,
    topForm: "PSG",
    spotlight: "Young talents rising",
  },
  {
    name: "Champions League",
    country: "Europe",
    code: "UEFA",
    matchesToday: 4,
    avgGoals: 3.2,
    successRate: 90,
    topForm: "Real Madrid",
    spotlight: "Knockout stage",
  },
]

export default function LeaguesPage() {
  const [query, setQuery] = useState("")

  const filtered = leagueData.filter((league) => league.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="min-h-screen bg-background">
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
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link
              href="/matches"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Matches
            </Link>
            <Link href="/leagues" className="text-sm font-medium text-primary">
              Leagues
            </Link>
          </nav>
          <Button size="sm">Sign In</Button>
        </div>
      </header>

      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Coverage intelligence</p>
            <h1 className="text-3xl font-bold mt-2">Global League Hub</h1>
            <p className="text-muted-foreground mt-2">Monitor league health, scoring trends, confidence, and spotlight stories.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Sync Data
            </Button>
            <Button className="gap-2">
              <Globe2 className="h-4 w-4" />
              Regional Filters
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Leagues</CardDescription>
              <CardTitle className="text-4xl font-bold">{leagueData.length}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Worldwide competitions monitored today
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average Confidence</CardDescription>
              <CardTitle className="text-4xl font-bold">84%</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Weighted across highlight predictions
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Daily Fixtures</CardDescription>
              <CardTitle className="text-4xl font-bold">46</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-success" />
              Connected to /api/matches view endpoints
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">League Spotlight</h2>
              <p className="text-muted-foreground text-sm">Surface dynamic storylines and performance signals per league.</p>
            </div>
            <div className="relative w-full md:w-80">
              <Input
                placeholder="Search leagues..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <ScrollArea className="h-[420px] rounded-3xl border bg-card/80 backdrop-blur">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
              {filtered.map((league) => (
                <Card key={league.name} className="border-border/60">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{league.name}</CardTitle>
                        <CardDescription>{league.country}</CardDescription>
                      </div>
                      <Badge variant="outline">{league.code}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Matches Today</p>
                      <p className="text-2xl font-bold">{league.matchesToday}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Goals</p>
                      <p className="text-2xl font-bold">{league.avgGoals}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Confidence</p>
                      <p className="text-2xl font-bold text-success">{league.successRate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Top Form</p>
                      <p className="text-base font-semibold">{league.topForm}</p>
                    </div>
                    <div className="col-span-2 rounded-xl bg-muted/40 p-3 text-sm">
                      <p className="text-muted-foreground mb-1">Spotlight</p>
                      <p className="font-medium">{league.spotlight}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">League Confidence Table</h2>
            <Badge variant="secondary">Live feed</Badge>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Confidence by Competition</CardTitle>
              <CardDescription>Use this table to prioritize scouting and betting focus areas.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>League</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Matches</TableHead>
                    <TableHead>Avg Goals</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leagueData.map((league) => (
                    <TableRow key={league.name}>
                      <TableCell className="font-medium">{league.name}</TableCell>
                      <TableCell>{league.country}</TableCell>
                      <TableCell>{league.matchesToday}</TableCell>
                      <TableCell>{league.avgGoals}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "border-transparent",
                            league.successRate > 85 ? "bg-success/15 text-success" : "bg-secondary text-secondary-foreground",
                          )}
                        >
                          {league.successRate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
