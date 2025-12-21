import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBlogBookmarks } from "@/hooks/useBlogBookmarks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BlogBookmarkButtonProps {
  slug: string;
  title: string;
  variant?: "default" | "compact";
}

export const BlogBookmarkButton = ({ slug, title, variant = "default" }: BlogBookmarkButtonProps) => {
  const { isBookmarked, toggleBookmark } = useBlogBookmarks();
  const bookmarked = isBookmarked(slug);

  const handleToggle = () => {
    const nowBookmarked = toggleBookmark(slug);
    toast.success(
      nowBookmarked 
        ? `"${title}" saved for later` 
        : `"${title}" removed from saved posts`
    );
  };

  if (variant === "compact") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className={cn(
          "transition-colors",
          bookmarked && "text-primary"
        )}
        title={bookmarked ? "Remove from saved" : "Save for later"}
      >
        <Bookmark className={cn("h-5 w-5", bookmarked && "fill-current")} />
      </Button>
    );
  }

  return (
    <Button
      variant={bookmarked ? "secondary" : "outline"}
      onClick={handleToggle}
      className={cn(
        "gap-2 transition-all",
        bookmarked && "bg-primary/10 border-primary/20"
      )}
    >
      <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
      {bookmarked ? "Saved" : "Save for Later"}
    </Button>
  );
};
