import { Zoom } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css'

const images = [
  '/assets/9772130.jpg',
  '/assets/fashion-collection-design-shopping-graphic-words.jpg',
  '/assets/2871017.jpg' // Using available image - replace with third image when available
];

const Main = () => {
  return (
    <div className="hero border-1 pb-3 mt-2">
      <div className="card text-white border-0 mx-3">
        <div className="slide-container">
          <Zoom scale={0.4}>
            {
              images.map((each, index) => <img key={index} style={{ width: "100%", height: "700px", margin: "auto", display: "block" }} src={each} />)
            }
          </Zoom>
        </div>
      </div>

    </div>

  )
}

export default Main;