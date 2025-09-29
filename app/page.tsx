import { ThemeSelector } from '@/components/theme-selector';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Theme Demo</h1>
            <p className="text-muted-foreground">
              Test out the different themes!
            </p>
          </div>
          <ThemeSelector />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Primary Theme</CardTitle>
              <CardDescription>This card uses primary colors</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Primary Button</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secondary Theme</CardTitle>
              <CardDescription>This card uses secondary colors</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                Secondary Button
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accent Theme</CardTitle>
              <CardDescription>This card uses accent colors</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Outline Button
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Destructive Theme</CardTitle>
              <CardDescription>
                This card uses destructive colors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full">
                Destructive Button
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Muted Theme</CardTitle>
              <CardDescription>This card uses muted colors</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">
                Ghost Button
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Card</CardTitle>
              <CardDescription>
                A combination of all theme colors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded bg-primary"></div>
                <div className="h-8 w-8 rounded bg-secondary"></div>
                <div className="h-8 w-8 rounded bg-accent"></div>
                <div className="h-8 w-8 rounded bg-destructive"></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Color palette preview
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
