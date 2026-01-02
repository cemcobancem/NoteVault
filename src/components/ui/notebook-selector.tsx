import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { db } from "@/lib/db";
import { Notebook } from "@/types";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface NotebookSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  onCreateNew?: () => void;
}

export function NotebookSelector({ value, onValueChange, onCreateNew }: NotebookSelectorProps) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const { toast } = useToast();

  const fetchNotebooks = async () => {
    try {
      const allNotebooks = await db.notebooks.toArray();
      setNotebooks(allNotebooks);
    } catch (error) {
      console.error("Failed to fetch notebooks:", error);
      toast({
        title: "Error",
        description: "Failed to load notebooks",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchNotebooks();
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Notebook</label>
        {onCreateNew && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs"
            onClick={onCreateNew}
          >
            <Plus className="h-3 w-3 mr-1" />
            New
          </Button>
        )}
      </div>
      <Select value={value || ""} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a notebook" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">None</SelectItem>
          {notebooks.map((notebook) => (
            <SelectItem key={notebook.id} value={notebook.id}>
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: notebook.color }}
                />
                {notebook.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}