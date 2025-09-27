import { getUsersLeaderboard } from "../actions/getUsersLeaderboard";
import Link from "next/link";
import UserCard from "./UserCard";

export default async function UsersLeaderboard() {
  const { users } = await getUsersLeaderboard();

  return (
    <div className="bg-background w-[100%] items-center justify-center rounded-lg p-10 pt-5 pb-5 text-center shadow-md mb-2">
      <p className="mb-2 text-xl font-bold">Top Rated Students</p>
      {users.map((user) => (
        <UserCard key={user.id} {...user} />
      ))}
      <Link
        className="text-sm text-gray-500 hover:underline"
        href={`/users_leaderboard`}
      >
        Show more
      </Link>
    </div>
  );
}
