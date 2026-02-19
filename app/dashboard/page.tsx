"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  created_at: string;
};

export default function Dashboard() {
  const router = useRouter();

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/");
      return;
    }

    await fetchBookmarks(session.user.id);
    subscribeToRealtime(session.user.id);
    setLoading(false);
  };

  const fetchBookmarks = async (userId: string) => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
  };

  const subscribeToRealtime = (userId: string) => {
    const channel = supabase
      .channel("bookmarks-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        () => fetchBookmarks(userId),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const addBookmark = async () => {
    if (!title.trim() || !url.trim()) return;

    setAdding(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    const { error } = await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: session.user.id,
      },
    ]);

    if (!error) {
      setTitle("");
      setUrl("");
    } else {
      console.log(error);
    }

    setAdding(false);
  };

  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const getDomain = (rawUrl: string) => {
    try {
      const u = new URL(rawUrl);
      return u.hostname.replace("www.", "");
    } catch {
      return rawUrl;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              🔖 My Bookmarks
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Save and organize the links you care about.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 active:scale-95 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Add Bookmark Card */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addBookmark();
          }}
          className="bg-white shadow-lg border border-transparent p-6 md:p-8 rounded-2xl mb-10 transition hover:shadow-xl"
        >
          <h2 className="text-xl font-semibold mb-6 text-gray-700">
            Add New Bookmark
          </h2>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Title Input */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-2">
                Website Title
              </label>
              <input
                type="text"
                placeholder="Ex: YouTube"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none text-gray-900 placeholder-gray-400 transition-all"
              />
            </div>

            {/* URL Input */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-2">
                Website URL
              </label>
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none text-gray-900 placeholder-gray-400 transition-all"
              />
            </div>

            {/* Add Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={adding || !title || !url}
                className="
                w-full
                bg-gradient-to-r from-indigo-600 to-indigo-500
                hover:from-indigo-700 hover:to-indigo-600
                active:scale-95
                disabled:bg-gray-300
                disabled:cursor-not-allowed
                px-6
                text-white
                py-3
                rounded-lg
                transition-all
                duration-200
                shadow-md
                hover:shadow-lg
              "
              >
                {adding ? "Adding..." : "Add Bookmark"}
              </button>
            </div>
          </div>
        </form>

        {/* Bookmark List */}
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : bookmarks.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-lg text-center text-gray-500">
            No bookmarks yet. Add your first one 🚀
          </div>
        ) : (
          <div className="grid gap-4">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white p-4 md:p-6 rounded-2xl shadow-sm flex justify-between items-center hover:shadow-md transition duration-200"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${getDomain(bookmark.url)}`}
                    alt="favicon"
                    className="w-8 h-8 rounded-sm mt-1"
                  />
                  <div>
                    <a
                      href={bookmark.url}
                      target="_blank"
                      className="text-base md:text-lg font-semibold text-indigo-600 hover:underline"
                    >
                      {bookmark.title}
                    </a>
                    <p className="text-sm text-gray-500 break-all mt-1">
                      {getDomain(bookmark.url)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => deleteBookmark(bookmark.id)}
                    className="bg-red-50 text-red-600 px-3 py-2 rounded-md hover:bg-red-100 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
