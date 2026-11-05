import Link from "next/link";
import { ArrowRight, CalendarDays, ChartPie, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const features = [
  {
    title: "Add expenses",
    description: "Record an amount, category and date. Add a note to remember the details.",
    icon: Plus,
  },
  {
    title: "Filter by month",
    description: "Find the spending you need with filters for category and month.",
    icon: CalendarDays,
  },
  {
    title: "See where money goes",
    description: "See your total spending and a breakdown by category as you explore your expenses.",
    icon: ChartPie,
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-12 sm:px-6 sm:py-20">
      <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-12 text-emerald-950 sm:px-12 sm:py-16">
        <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-emerald-800">
          Personal expense tracker
        </p>
        {/* Đề yêu cầu đúng chữ SpendWise và đúng testid home-title. */}
        <h1 data-testid="home-title" className="text-5xl font-bold tracking-tight sm:text-7xl">
          SpendWise
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-emerald-900">
          Record your daily expenses and review how much you spend by month and category.
        </p>
        <Link href="/expenses" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-5 py-3 font-medium text-white transition-colors hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">
          View expenses <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>

      <section aria-labelledby="features-title" className="space-y-6">
        <div className="space-y-2">
          <h2 id="features-title" className="text-2xl font-semibold tracking-tight">
            A clearer picture of your spending
          </h2>
          <p className="text-muted-foreground">A few simple tools to keep your expenses organized.</p>
        </div>
        {/* Một cột trên điện thoại, ba cột từ màn hình md trở lên. */}
        <div className="grid gap-5 md:grid-cols-3">
          {features.map(({ title, description, icon: Icon }) => (
            <Card key={title} className="min-w-0">
              <CardHeader className="gap-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-semibold">{title}</h3>
              </CardHeader>
              <CardContent>
                <p className="leading-6 text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
