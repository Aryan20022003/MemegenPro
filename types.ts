export interface Meme {
  id: string;
  imageUrl: string;
  topText: string;
  bottomText: string;
  sourceUrl: string;
  reactions: { [key: string]: number };
  comments: string[];
  userReaction: string | null;
  isApproved: boolean;
}

export interface GeneratedMemeData {
  topText: string;
  bottomText: string;
  imageUrl: string;
}
