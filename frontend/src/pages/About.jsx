import {useNavigate} from 'react-router-dom';

function About() {
   const navigate=useNavigate();
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen text-gray-900 px-8"
      style={{ backgroundColor: '#E4D4C8' }}
    >
      <div 
        className="max-w-2xl p-8 rounded-lg shadow-lg"
        style={{ backgroundColor: '#D0B49F' }}
      >
        <h2 
          className="text-4xl font-bold mb-6 text-center"
          style={{ color: '#523A28' }}
        >
          About Our Jewelry
        </h2>
        
        <div className="space-y-4 text-lg">
          <p style={{ color: '#523A28' }}>
            Welcome to our jewelry collection! We specialize in handcrafted pieces 
            that combine traditional techniques with modern design.
          </p>
          
          <p style={{ color: '#523A28' }}>
            Each piece is carefully created with attention to detail and quality. 
            Our artisans use only the finest materials to ensure every item is 
            unique and beautiful.
          </p>
          
          <p style={{ color: '#523A28' }}>
            From elegant necklaces to stunning rings, we offer jewelry that 
            tells your story and celebrates life's special moments.
          </p>
        </div>
        
        <div className="mt-8 text-center">
          <button onClick={()=>{navigate("/")}}
            className="px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#A47551' }}
          >
            View Our Collection
          </button>
        </div>
      </div>
    </div>
  );
}

export default About;