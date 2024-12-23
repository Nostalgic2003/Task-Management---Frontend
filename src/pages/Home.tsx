import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useKanbanStore from '../store/useKanbanStore';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from 'react-router-dom';
import useUserStore from '@/store/userStore';

// Form Schema
const createBoardSchema = z.object({
  name: z.string().min(1, "Board name is required"),
  description: z.string().optional(),
  visibility: z.enum(["private", "public"]),
});

type CreateBoardForm = z.infer<typeof createBoardSchema>;

export default function Home() {
  const { user } = useUserStore()
  const { boards, isLoading, fetchBoards, createBoard } = useKanbanStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate()

  // Initialize form
  const form = useForm<CreateBoardForm>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      name: "",
      description: "",
      visibility: "private",
    },
  });

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const onSubmit = async (data: CreateBoardForm) => {
    await createBoard(data);
    setIsDialogOpen(false);
    form.reset();
  };
  const ownedBoards = boards.filter(board => String(board.user_id) === String(user?.id));
  const memberBoards = boards.filter(board => String(board.user_id) !== String(user?.id));


  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Boards</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Board
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Board</DialogTitle>
              <DialogDescription>
                Create a new board to start organizing your tasks.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Board Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter board name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter board description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  {isLoading ? "Creating..." : "Create Board"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Owned Boards Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Owned Boards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ownedBoards.map((board) => (
            <Card key={board.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{board.name}</CardTitle>
                <CardDescription>{board.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  {board.members?.length || 0} members
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/board/${board.id}`)}
                >
                  Open
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Member Boards Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Shared with Me</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memberBoards.map((board) => (
            <Card key={board.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{board.name}</CardTitle>
                <CardDescription>{board.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Owner: {board.owner?.name}
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/board/${board.id}`)}
                >
                  Open
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}