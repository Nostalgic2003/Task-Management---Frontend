import { Bell, User, LogOut, Settings, UserPlus, Users, Copy, X } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import useUserStore from "../store/userStore"
import useKanbanStore from "../store/useKanbanStore"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const memberSchema = z.object({
  user_id: z.number().min(1, "Please select a user"),
});

type MemberFormData = z.infer<typeof memberSchema>;

const Header = () => {
  const { isAuthenticated, logout } = useUserStore()
  const { currentBoard, users, addBoardMember, removeBoardMember, fetchUsers } = useKanbanStore()
  const navigate = useNavigate()
  const { boardId } = useParams()

  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)

  useEffect(() => {
    if (isShareModalOpen) {
      fetchUsers();
    }
  }, [isShareModalOpen, fetchUsers]);

  const memberForm = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
  });
  const availableUsers = users.filter((u) =>
    !currentBoard?.members?.some((member) => Number(member.id) === u.id)
  );

  console.log('All users:', users); // Debug log
  console.log('Board members:', currentBoard?.members); // Debug log
  console.log('Available users:', availableUsers); // Debug log

  return (
    <>
      <header className="flex h-14 items-center justify-between bg-[#1a237e] px-4 lg:h-[60px]">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-white">Task Management</h1>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated && boardId && (
            <>
              {/* Members Button */}
              <Dialog open={isMembersModalOpen} onOpenChange={setIsMembersModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    <Users className="h-5 w-5 mr-2" />
                    Members
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1e1b4b] border border-gray-600">
                  <DialogHeader>
                    <DialogTitle className="text-white">Board Members</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {currentBoard?.members?.map((member) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarImage src={"/placeholder-avatar.jpg"} />
                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white">{member.name}</p>
                            <p className="text-sm text-gray-400">{member.email}</p>
                          </div>
                        </div>
                        {currentBoard.user_id !== Number(member.id) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBoardMember(parseInt(boardId), Number(member.id))}
                            className="text-red-400 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Share Button */}
              <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Share
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1e1b4b] border border-gray-600">
                  <DialogHeader>
                    <DialogTitle className="text-white">Share board</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Share Link */}
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Board link</label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={`${window.location.origin}/boards/${boardId}`}
                          className="bg-transparent border-gray-600 text-white"
                        />
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/boards/${boardId}`);
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Add Member Form */}
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Add member</label>
                      <Form {...memberForm}>
                        <form
                          onSubmit={memberForm.handleSubmit((data) => {
                            if (boardId) {
                              addBoardMember(parseInt(boardId), {
                                user_id: data.user_id,
                                role: "member"
                              });
                              memberForm.reset();
                            }
                          })}
                          className="flex gap-2"
                        >
                          <FormField
                            control={memberForm.control}
                            name="user_id"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <Select
                                  onValueChange={(value) => field.onChange(parseInt(value))}
                                  defaultValue={field.value?.toString()}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-transparent border-gray-600 text-white">
                                      <SelectValue placeholder="Select a user" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-[#1e1b4b] border-gray-600">
                                    {availableUsers.map((user) => (
                                      <SelectItem
                                        key={user.id}
                                        value={user.id.toString()}
                                        className="text-white hover:bg-white/10"
                                      >
                                        {user.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="bg-white/10 hover:bg-white/20 text-white">
                            Add
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>     
          )}

          {/* Existing notification and user menu */}
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" className="text-white">
                <Bell className="h-5 w-5" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex cursor-pointer items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-avatar.jpg" alt="Avatar" />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-48">
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      className="flex w-full justify-start gap-2"
                      onClick={() => navigate('/settings')}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex w-full justify-start gap-2 text-red-500 hover:text-red-500"
                      onClick={() => {
                        logout()
                        navigate('/')
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <Button
              variant="outline"
              className="text-[#1a237e]"
              onClick={() => navigate("/")}
            >
              Login
            </Button>
          )}
        </div>
      </header>
      <Outlet />
    </>
  )
}

export default Header