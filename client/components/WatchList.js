import React from 'react'
import { connect } from 'react-redux'
import {createList, removeWList} from '../store'
import Media from './Media'
import { Link } from 'react-router-dom'
import {loadWatchList} from '../store'



class WatchList extends React.Component {
  constructor() {
    super()

  }
  componentDidMount() {
    this.props.loadWatchList()
  }


  render() {
    const { lists, dbMedia, match, destroy} = this.props
    const m = match.params.id*1
    //const {lists} = this.state
   
    
    return (
      <div>
        <ul>
            {
              lists.length === 0 ? (
                <h3>Your watchlist is currently empty</h3>
              ) : (
                <div>
                  <h3>Here are your saved movies:</h3>
                  {lists.map(list => {
                    const WList = dbMedia.find((media => media.id === list.mediaId))
                   
              
                    return(
                    <li key = {list.id}>
                      <span style={{display: 'flex'}}>

                      <img
                          src={
                          WList.poster_path
                            ? `https://image.tmdb.org/t/p/w300/${WList.poster_path}`
                            : 'https://user-images.githubusercontent.com/24848110/33519396-7e56363c-d79d-11e7-969b-09782f5ccbab.png'
                          } />
          
                      <button onClick={() => destroy(list)}>Remove</button>
                    </span>

                      </li>
                    
                    )
        
                    })}

                </div>
              )
            }
          </ul>
      </div>
      )
    }
} 

const mapDispatch = function(dispatch) {
  return {
    destroy: (list) => {
      dispatch(removeWList(list))
    },
    loadWatchList() {
      dispatch(loadWatchList())
    }
    
    
  }
}

const mapState = ( { lists, dbMedia, media}) => {
  return {
    lists,
    dbMedia,
    media,
    
  }
}


export default connect(mapState, mapDispatch)(WatchList)