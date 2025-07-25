import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Crown, 
  Star, 
  Shield, 
  Truck, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Award,
  Gem
} from 'lucide-react';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: "Timeless Elegance",
      subtitle: "Discover our exclusive diamond collection",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop",
      cta: "Shop Diamonds",
      link: "/products?category=diamonds"
    },
    {
      title: "Handcrafted Beauty",
      subtitle: "Artisan jewelry made with precision",
      image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=600&fit=crop",
      cta: "Explore Collection",
      link: "/products"
    },
    {
      title: "Wedding Perfection",
      subtitle: "Find your perfect wedding rings",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=600&fit=crop",
      cta: "Wedding Rings",
      link: "/products?category=rings"
    }
  ];

  const featuredCategories = [
    {
      name: "Rings",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=300&fit=crop",
      count: "120+ designs",
      link: "/products?category=rings"
    },
    {
      name: "Necklaces",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop",
      count: "80+ designs",
      link: "/products?category=necklaces"
    },
    {
      name: "Earrings",
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop",
      count: "95+ designs",
      link: "/products?category=earrings"
    },
    {
      name: "Bracelets",
      image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=300&h=300&fit=crop",
      count: "65+ designs",
      link: "/products?category=bracelets"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Lifetime Warranty",
      description: "Every piece comes with our comprehensive lifetime warranty"
    },
    {
      icon: Truck,
      title: "Free Shipping",
      description: "Complimentary shipping on all orders above ₹10,000"
    },
    {
      icon: Award,
      title: "Certified Jewelry",
      description: "All diamonds and gemstones come with authenticity certificates"
    },
    {
  icon: Gem,
  title: "New Arrivals",
  description: "Discover our latest jewelry designs"
}
  ];

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E4D4C8] to-[#D0B49F]">
      
      {/* Hero Section with Carousel */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <div className="animate-fade-in">
            <Crown className="h-16 w-16 mx-auto mb-6 text-[#E4D4C8]" />
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-wider">
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-[#E4D4C8] font-light">
              {heroSlides[currentSlide].subtitle}
            </p>
            <Link
              to={heroSlides[currentSlide].link}
              className="inline-flex items-center space-x-2 bg-[#A47551] hover:bg-[#523A28] text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              <span>{heroSlides[currentSlide].cta}</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 z-20"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 z-20"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#523A28] mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-[#A47551] max-w-2xl mx-auto">
            Explore our curated collections of fine jewelry, each piece crafted with exceptional attention to detail
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredCategories.map((category, index) => (
            <Link
              key={category.name}
              to={category.link}
              className="group relative overflow-hidden rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-500"
            >
              <div className="aspect-square">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-1">{category.name}</h3>
                <p className="text-sm text-[#E4D4C8]">{category.count}</p>
              </div>
              
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowRight className="h-5 w-5 text-white" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Sparkles className="h-12 w-12 mx-auto text-[#A47551] mb-4" />
            <h2 className="text-4xl md:text-5xl font-bold text-[#523A28] mb-4">
              Why Choose SváRIN?
            </h2>
            <p className="text-lg text-[#A47551] max-w-2xl mx-auto">
              Experience unparalleled quality and service with every purchase
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center group hover:transform hover:scale-105 transition-all duration-300"
              >
                <div className="bg-gradient-to-br from-[#A47551] to-[#523A28] rounded-2xl p-6 mb-4 mx-auto w-20 h-20 flex items-center justify-center group-hover:shadow-xl transition-all duration-300">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#523A28] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#A47551] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

     
    </div>
  );
};

export default Home;