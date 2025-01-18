import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { POSTS } from "../../utils/db/dummy";
import { baseUrl } from '../../constant/url';
import { useQuery } from '@tanstack/react-query'
import { useEffect } from "react";

const Posts = ({ feedType, username, userId }) => {

	const getPostEndPoint = () => {
		switch (feedType) {
			case "forYou": {
				return `${baseUrl}/api/posts/allpost`
			};
			case "following": {
				return `${baseUrl}/api/posts/following`
			};
			case "posts": {
				return `${baseUrl}/api/posts/user/${username}`
			};
			case "likes": {
				return `${baseUrl}/api/posts/likedpost/${userId}`
			};
			default: {
				return `${baseUrl}/api/posts/allpost`
			}
		}
	}

	const POST_ENDPOINT = getPostEndPoint();

	const { data: postsData, isLoading, refetch, isRefetching } = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			try {
				const res = await fetch(POST_ENDPOINT, {
					method: "GET",
					credentials: "include",
					headers: {
						"Content-Type": "application/json"
					}
				})
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something Went Wrong");
				}
				console.log("data:", data);

				return data;
			} catch (error) {
				throw error;
			}
		}
	})
	// const posts = Array.isArray(postsData) ? postsData : [postsData];
	const posts = Array.isArray(postsData) ? postsData.filter(post => post && post._id):[];
		useEffect(() => {
			refetch()
		}, [feedType, refetch, username])
	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;