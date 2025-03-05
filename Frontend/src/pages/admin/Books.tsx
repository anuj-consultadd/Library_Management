import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Plus, Loader2, Trash } from "lucide-react";
import { Book } from "../../types/book";
import { bookService } from "../../services/bookService";
import { useAppToast } from "../../hooks/useToast";
import Navbar from "../../components/Navbar";

type BookFormData = {
  title: string;
  author: string;
};

type BulkAddFormData = {
  books: { title: string; author: string }[];
};

const AdminBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [bulkAddDialogOpen, setBulkAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { showSuccess, showError } = useAppToast();

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd },
  } = useForm<BookFormData>();

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setEditValue,
    formState: { errors: errorsEdit },
  } = useForm<BookFormData>();

  const {
    control,
    register: registerBulk,
    handleSubmit: handleSubmitBulk,
    reset: resetBulk,
    formState: { errors: errorsBulk },
  } = useForm<BulkAddFormData>({
    defaultValues: {
      books: [{ title: "", author: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "books",
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const data = await bookService.getAdminBooks();
      setBooks(data);
    } catch (error) {
      showError("Failed to fetch books");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onAddBook = async (data: BookFormData) => {
    try {
      setActionLoading(true);
      const newBooks = await bookService.addBook(data);
      setBooks((prev) => [...prev, ...newBooks]);
      showSuccess("Book added successfully");
      setAddDialogOpen(false);
      resetAdd();
    } catch (error) {
      showError("Failed to add book");
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const onBulkAddBooks = async (data: BulkAddFormData) => {
    try {
      setActionLoading(true);
      const newBooks = await bookService.addBook(data.books);
      setBooks((prev) => [...prev, ...newBooks]);
      showSuccess(`${newBooks.length} books added successfully`);
      setBulkAddDialogOpen(false);
      resetBulk();
    } catch (error) {
      showError("Failed to add books");
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const onEditBook = async (data: BookFormData) => {
    if (!selectedBook) return;

    try {
      setActionLoading(true);
      const updatedBook = await bookService.updateBook(selectedBook.id, data);
      setBooks((prev) =>
        prev.map((book) => (book.id === selectedBook.id ? updatedBook : book))
      );
      showSuccess("Book updated successfully");
      setEditDialogOpen(false);
    } catch (error) {
      showError("Failed to update book");
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const onDeleteBook = async () => {
    if (!selectedBook) return;

    try {
      setActionLoading(true);
      await bookService.deleteBook(selectedBook.id);
      setBooks((prev) => prev.filter((book) => book.id !== selectedBook.id));
      showSuccess("Book deleted successfully");
      setDeleteDialogOpen(false);
    } catch (error) {
      showError("Failed to delete book");
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const openEditDialog = (book: Book) => {
    setSelectedBook(book);
    setEditValue("title", book.title);
    setEditValue("author", book.author);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (book: Book) => {
    setSelectedBook(book);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-3xl font-bold w-full text-center md:text-left">
            Manage Books
          </h1>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Button
              className="w-full md:w-auto"
              onClick={() => setBulkAddDialogOpen(true)}
            >
              Bulk Add Books
            </Button>
            <Button
              className="w-full md:w-auto"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Book
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Library Collection</CardTitle>
            <CardDescription>
              Manage the books available in your library
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : books.length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book) => (
                      <TableRow key={book.id} className="block md:table-row">
                        <TableCell className="font-medium block md:table-cell">
                          {book.title}
                        </TableCell>
                        <TableCell className="block md:table-cell">
                          {book.author}
                        </TableCell>
                        <TableCell className="block md:table-cell">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              book.available
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {book.available ? "Available" : "Borrowed"}
                          </span>
                        </TableCell>
                        <TableCell className="block md:table-cell">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openEditDialog(book)}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(book)}
                                className="text-red-600"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No books found. Add some books to get started.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Book Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Book</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitAdd(onAddBook)}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    {...registerAdd("title", { required: "Title is required" })}
                  />
                  {errorsAdd.title && (
                    <p className="text-red-500 text-sm">
                      {errorsAdd.title.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    {...registerAdd("author", {
                      required: "Author is required",
                    })}
                  />
                  {errorsAdd.author && (
                    <p className="text-red-500 text-sm">
                      {errorsAdd.author.message}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetAdd();
                    setAddDialogOpen(false);
                  }}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={actionLoading}>
                  {actionLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Book
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Bulk Add Dialog */}
        <Dialog open={bulkAddDialogOpen} onOpenChange={setBulkAddDialogOpen}>
          <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Bulk Add Books</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitBulk(onBulkAddBooks)}>
              <div className="grid gap-4 py-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid gap-2">
                    <Label htmlFor={`books.${index}.title`}>Title</Label>
                    <Input
                      id={`books.${index}.title`}
                      {...registerBulk(`books.${index}.title`, {
                        required: "Title is required",
                      })}
                    />
                    {errorsBulk.books?.[index]?.title && (
                      <p className="text-red-500 text-sm">
                        {errorsBulk.books[index]?.title?.message}
                      </p>
                    )}
                    <Label htmlFor={`books.${index}.author`}>Author</Label>
                    <Input
                      id={`books.${index}.author`}
                      {...registerBulk(`books.${index}.author`, {
                        required: "Author is required",
                      })}
                    />
                    {errorsBulk.books?.[index]?.author && (
                      <p className="text-red-500 text-sm">
                        {errorsBulk.books[index]?.author?.message}
                      </p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2"
                      onClick={() => remove(index)}
                    >
                      <Trash className="mr-2 h-4 w-4" /> Remove Book
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => append({ title: "", author: "" })}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Another Book
                </Button>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetBulk();
                    setBulkAddDialogOpen(false);
                  }}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={actionLoading}>
                  {actionLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Books
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Book Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Book</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitEdit(onEditBook)}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    {...registerEdit("title", {
                      required: "Title is required",
                    })}
                  />
                  {errorsEdit.title && (
                    <p className="text-red-500 text-sm">
                      {errorsEdit.title.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-author">Author</Label>
                  <Input
                    id="edit-author"
                    {...registerEdit("author", {
                      required: "Author is required",
                    })}
                  />
                  {errorsEdit.author && (
                    <p className="text-red-500 text-sm">
                      {errorsEdit.author.message}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetEdit();
                    setEditDialogOpen(false);
                  }}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={actionLoading}>
                  {actionLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Book
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete "
                {selectedBook?.title}" from the library.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDeleteBook}
                className="bg-red-500 hover:bg-red-600"
                disabled={actionLoading}
              >
                {actionLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default AdminBooks;
