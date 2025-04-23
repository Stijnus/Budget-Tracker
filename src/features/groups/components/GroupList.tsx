import { useTranslation } from "react-i18next";
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

interface GroupListProps {
  groups: any[];
}

export function GroupList({ groups }: GroupListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map((group) => (
        <Card key={group.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={group.avatar_url} alt={group.name} />
                  <AvatarFallback>
                    {group.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  {!group.is_active && (
                    <Badge variant="outline" className="ml-2">
                      {t("groups.inactive")}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <CardDescription className="line-clamp-2 mt-1">
              {group.description || t("groups.noDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="mr-1 h-4 w-4" />
              <span>{t("groups.membersCount", { count: 0 })}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="default"
              className="w-full"
              onClick={() => navigate(`/groups/${group.id}`)}
            >
              {t("groups.viewGroup")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
