import { useEffect, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import axios from "axios";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { LoaderCircle } from "lucide-react";
interface usersProp {
  username: string;
}
export function SearchBox() {
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<usersProp[] | []>([]);
  const [q, setQ] = useState("");
  const debouncedSearchTerm = useDebounce(q, 300);
  const searchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `/api/search-users?q=${debouncedSearchTerm}`
      );
      setResults(data.users);
      console.log(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchUsers();
    }
    setResults([]);
  }, [debouncedSearchTerm]);
  return (
    <div className="mx-4 border rounded-lg ">
      <div className="flex border items-center rounded-lg shadow-md w-full">
        <input
          className="w-95/100 p-4 outline-none"
          placeholder="Search users for chatting ..."
          onChange={(e) => setQ(e.target.value)}
        />
        {loading && <LoaderCircle className="mr-2" />}
      </div>
      <div className=" z-20">
        {results.map((searchItem, index) => {
          return (
            <Link
              href={`/chat/${searchItem.username}`}
              className="flex w-full border-b px-4 shadow-md items-center"
              key={index}
            >
              <Avatar className="w-10 h-10 rounded-3xl">
                <AvatarImage
                  src={
                    "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
                  }
                  className="rounded-3xl"
                />
                <AvatarFallback>
                  {searchItem.username
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <p className="text-lg p-4  w-full"> {searchItem.username}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
