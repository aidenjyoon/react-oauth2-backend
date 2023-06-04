export interface interfaceUser {
  googleId?: string;
  twitterId?: string;
  githubId?: string;
  twitchId?: string;
  username: string;
}

export interface IMongoDBUser {
  googleId?: string;
  twitterId?: string;
  githubId?: string;
  twitchId?: string;
  username: string;
  __v: number;
  _id: string;
}
