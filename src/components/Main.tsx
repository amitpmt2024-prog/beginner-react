import { Zoom } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css'

const images = [
  'https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_t.png',
  'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_t.png',
  'https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_t.png'
];

const Main = () => {
  return (
    <div className="hero border-1 pb-3 mt-2">
      <div className="card text-white border-0 mx-3">
        <div className="slide-container">
          <Zoom scale={0.4}>
            {
              images.map((each, index) => <img key={index} style={{ width: "50%", height: "500px",margin:"auto",display:"block" }} src={each} />)
            }
          </Zoom>
        </div>
      </div>

    </div>

  )
}

export default Main;