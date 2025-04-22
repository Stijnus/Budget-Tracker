import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Home } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold mb-2">404</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <h2 className="text-xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Button asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Go back home</span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
