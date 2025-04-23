// Translation imports removed
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, ArrowRight } from "lucide-react";

interface Group {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  is_active: boolean;
  role: string;
}

interface GroupListProps {
  groups: Group[];
}

export function GroupList({ groups }: GroupListProps) {
  // Translation hooks removed
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map((group) => (
        <Card
          key={group.id}
          className="overflow-hidden border-l-4 border-l-blue-500 hover:shadow-md transition-shadow"
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Avatar className="border-2 border-blue-100">
                  {group.avatar_url && (
                    <AvatarImage src={group.avatar_url} alt={group.name} />
                  )}
                  <AvatarFallback className="bg-blue-50 text-blue-700">
                    {group.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <div className="flex gap-2 mt-1">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">
                      {group.role.charAt(0).toUpperCase() + group.role.slice(1)}
                    </Badge>
                    {!group.is_active && (
                      <Badge
                        variant="outline"
                        className="text-gray-500 border-gray-300"
                      >
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <CardDescription className="line-clamp-2 mt-2">
              {group.description || "No description available"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="mr-1 h-4 w-4 text-blue-500" />
              <span>0 members</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="default"
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate(`/groups/${group.id}`)}
            >
              View Group
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
