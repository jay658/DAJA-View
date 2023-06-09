import React, { useState } from 'react';
import { connect } from 'react-redux';
import { loadPosts, createPost, updatePostLikes } from '../store';
import { Avatar, Button, TextField } from '@material-ui/core';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import { Link } from 'react-router-dom';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import PostComment from './PostComment';
import Rating from '@material-ui/lab/Rating';
import Post from './Post';



class Posts extends React.Component {
  constructor() {
    super();
    this.state = {
      showCommentBox: null,
      filter: '',
      

    };
    this.handleShowCommentBox = this.handleShowCommentBox.bind(this);
  }

  handleShowCommentBox() {
    this.setState({ showCommentBox: null });
  }

 
  render() {
    const { posts, users, updatePostLikes, auth, dbMedia, id } = this.props;
    let { friendsId } = this.props;
    let myPosts;
    if (id) myPosts = posts.filter((post) => post.userId === id * 1);
    else myPosts = posts.filter((post) => post.userId === auth.id);
    const { showCommentBox, filter } = this.state;

    if (friendsId) {
      friendsId = [...friendsId, auth.id];
      myPosts = posts.filter((post) => friendsId.includes(post.userId));
    }

    const likedBy = (likes) => {
      let string = '';
      if (likes.length === 1) string = `${likes[0]} likes this`;
      else if (likes.length === 2)
        string = `${likes[0]} and ${likes[1]} like this`;
      else if (likes.length === 3)
        string = `${likes[0]}, ${likes[1]} and ${likes[2]} like this`;
      else
        string = `${likes[0]}, ${likes[1]} and ${
          likes.length - 2
        } others like this`;
      return string;
    };

    const filterPosts = (filter, posts) => {
      return posts.filter(
        (post) =>
          post.rating &&
          dbMedia
            .find((media) => media.id === post.mediaId)
            ?.title?.toLowerCase() 
            .includes(filter?.toLowerCase())
      );
    };

    const searchPosts = filterPosts(filter, myPosts);
    return (
      <div display="flex" align-items="center">
        <div className='filter-divider' style={{width:'50%', margin: '20px auto 50px', display:'flex', flexDirection:'column'}}>
        <TextField
          id="standard-basic"
          value={filter}
          label={`Find movie review`}
          onChange={(ev) => this.setState({ filter: ev.target.value })}
        />
        <Button
          onClick={() => {
            this.setState({filter:''});
          }}
        >
          Clear
        </Button>
        </div>
        {(filter ? searchPosts : myPosts).map((post) => {
          const comments = [];
          const media = dbMedia.find((media) => media.id === post.mediaId);
          const user = users.find((user) => user.id === post.userId);
          if (post.postId || !user) return null;
          posts.forEach((item) => {
            if (item.postId === post.id) comments.push(item);
          });
          return (
            <div key={post.id} className="postOut postnotcomment">
              <div className="postoutline">
                <div className="post">
                  <div className="post_body">

                    <div className="post_header">
                      <div className="post_headerText">
                        <h3>
                          <Link to={`/profile/${user.id}`}>
                            <Avatar src={user.avatarUrl} style={{backgroundColor:'linear-gradient(to right, #BF953F, #f7f1b1)'}} />
                          </Link>
                          <div>
                            {user.username}{' '}
                            <span className="postDetail">
                              •{Date(post.createdAt).slice(4, 10)}{' '}
                            </span>
                          </div>
                        </h3>
                      </div>
                      <div className="post_headerDesc">
                        <p>{post.content}</p>
                      </div>
                      <div className='movierating'>
                        {post.rating ? (
                          <>
                            <div className="postDetail">
                              Review for {media?.title}
                            </div>
                            <Rating
                              name="Rated"
                              readOnly
                              value={post.rating}
                              max={10}
                            />
                            <br/>
                            <img className='postImg'
                              src={
                                media?.poster_path
                                  ? `https://image.tmdb.org/t/p/w300/${media?.poster_path}`
                                  : 'https://user-images.githubusercontent.com/24848110/33519396-7e56363c-d79d-11e7-969b-09782f5ccbab.png'
                              }
                            />
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="post_footer">
                    <Button
                      onClick={() => {
                        if (showCommentBox !== post.id)
                          this.setState({ showCommentBox: post.id });
                        else this.setState({ showCommentBox: null });
                      }}
                    >
                      {comments.length}
                      <ChatBubbleOutlineIcon fontSize="small" />
                    </Button>
                    {post.likes.includes(auth.username) ? (
                      <Button>
                        {post.likes.length}
                        <FavoriteIcon
                          fontSize="small"
                          onClick={() => {
                            updatePostLikes(post.id, auth.username)
                          }}
                        />
                      </Button>
                    ) : (
                      <Button>
                        {post.likes.length}
                        <FavoriteBorderIcon
                          fontSize="small"
                          onClick={() => {
                            updatePostLikes(post.id, auth.username);
                          }}
                        />
                      </Button>
                    )}
                  </div>
                  {/* <h4>{!post.likes.length? '': likedBy(post.likes)}</h4> */}
                </div>
                <PostComment
                  user={user}
                  post={post}
                  showCommentBox={showCommentBox}
                  handleComment={this.handleShowCommentBox}
                />
                <div className="commentsbox">
                  {comments.map((comment) => {
                    const commentUser = users.find(
                      (user) => user.id === comment.userId
                    );
                    return (
                      <div key={comment.id} className="postOut">
                        <div className="post postcomment">
                          <div className="post_body">
                            <Link to={`/profile/${commentUser.id}`}>
                              <Avatar src={commentUser.avatarUrl} />
                            </Link>

                            <div className="post_header">
                              <div className="post_headerText">
                                <h3 className="postDetail">
                                  replying to {user.username}'s post
                                </h3>
                                <h3>
                                  {commentUser.username}{' '}
                                  <span className="postDetail">
                                    •{Date(comment.createdAt).slice(4, 10)}{' '}
                                  </span>
                                </h3>
                              </div>
                              <div className="post_headerDesc">
                                <p>{comment.content}</p>
                              </div>
                            </div>
                          </div>
                          <div className="post_footer">
                            {comment.likes.includes(auth.username) ? (
                              <Button>

                                {comment.likes.length}
                                <FavoriteIcon
                                  fontSize="small"
                                  onClick={() => {
                                    updatePostLikes(comment.id, auth.username);
                                   
                                  }}
                                />
                              </Button>
                            ) : (
                              <Button>
                                {comment.likes.length}
                                <FavoriteBorderIcon
                                  fontSize="small"
                                  onClick={() => {
                                    updatePostLikes(comment.id, auth.username);
                                  }}
                                />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

// const mapState = ({ auth, users, posts }) => {
//   return {
//     auth,
//     users,
//     posts,
//   };
// };

const mapDispatch = (dispatch) => {
  return {
    loadPosts: () => {
      dispatch(loadPosts());
    },
    updatePostLikes: (postId, username) => {
      dispatch(updatePostLikes(postId, username));
    },
  };
};

export default connect((state) => state, mapDispatch)(Posts);
