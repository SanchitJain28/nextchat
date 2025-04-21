import { useState } from "react";

export function SearchBox() {
  const [results, setResults] = useState<any>(null);
  return (
    <div className="mx-4">
      <input
        className="border p-4 rounded-lg shadow-md w-full"
        placeholder="Search users for chatting ..."
      />
      {[1, 2, 3, 4, 5, 6, 7].map((searchItem,index) => {
        return <div className="p-4 border-b" key={index} >
            <p className="text-lg"> user {searchItem}</p>
        </div>
      })}
    </div>
  );
}
