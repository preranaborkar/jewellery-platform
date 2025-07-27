// frontend/src/services/productService.js
class ProductService {
  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Get auth headers
  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  // Create product with images
  async createProduct(productData) {
    try {
      const formData = new FormData();

      // Add basic product data
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('shortDescription', productData.shortDescription);
      formData.append('price', productData.price);
      formData.append('category', productData.category);
      formData.append('metalType', productData.metalType);
      formData.append('metalPurity', productData.metalPurity);
      formData.append('stock', productData.stock);

      // Add images - IMPORTANT: Use 'images' as field name (matches backend)
      if (productData.images && productData.images.length > 0) {
        productData.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      // Debug: Log form data contents
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: this.getAuthHeaders(), // Don't set Content-Type for FormData
        body: formData
      });

      const data = await response.json();
      console.log('Create product response:', data);

      if (!response.ok) {
        throw {
          status: response.status,
          data: data
        };
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Product creation error:', error);
      if (error.status) {
        throw error;
      } else {
        throw {
          status: 0,
          data: { message: 'Network error. Please try again.' }
        };
      }
    }
  }

  // Update product
  async updateProduct(productId, productData) {
    try {
      const formData = new FormData();

      // Add basic product data
      Object.keys(productData).forEach(key => {
        if (key !== 'images' && productData[key] !== undefined && productData[key] !== null) {
          formData.append(key, productData[key]);
        }
      });

      // Add new images
      if (productData.images && productData.images.length > 0) {
        productData.images.forEach((image) => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      }

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          data: data
        };
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      if (error.status) {
        throw error;
      } else {
        throw {
          status: 0,
          data: { message: 'Network error. Please try again.' }
        };
      }
    }
  }

  // Delete product
  async deleteProduct(productId) {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          data: data
        };
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      if (error.status) {
        throw error;
      } else {
        throw {
          status: 0,
          data: { message: 'Network error. Please try again.' }
        };
      }
    }
  }

//get categories
  async getCategories() { 
    try {
      const response = await fetch('/api/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          data: data
        };
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      if (error.status) {
        throw error;
      } else {
        throw {
          status: 0,
          data: { message: 'Network error. Please try again.' }
        };
      }
    }
  }


  // Get inventory data
  async getInventory() {
    try {
      const response = await fetch('/api/admin/products/inventory', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          data: data
        };
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      if (error.status) {
        throw error;
      } else {
        throw {
          status: 0,
          data: { message: 'Network error. Please try again.' }
        };
      }
    }
  }


  // Handle different error responses
  getErrorMessage(status, data) {
    switch (status) {
      case 400:
        if (data.errors && Array.isArray(data.errors)) {
          return data.errors.map(err => err.msg || err.message).join(', ');
        } else if (data.message) {
          return data.message;
        } else {
          return 'Invalid request. Please check your input.';
        }

      case 401:
        return 'Authentication required. Please login again.';

      case 403:
        return 'Access denied. Admin privileges required.';

      case 404:
        return 'Product not found.';

      case 409:
        return 'Product already exists or conflict occurred.';

      case 413:
        return 'File too large. Maximum size is 5MB per image.';

      case 422:
        if (data.errors && Array.isArray(data.errors)) {
          return data.errors.map(err => err.msg || err.message).join(', ');
        } else {
          return 'Please check your input and try again.';
        }

      case 429:
        return 'Too many requests. Please try again later.';

      case 500:
        return 'Server error. Please try again later.';

      case 0:
        return 'Network error. Please try again.';

      default:
        if (data.message) {
          return data.message;
        } else {
          return 'Request failed. Please try again.';
        }
    }
  }



  // Get all admin products
  async getAdminProducts(page = 1, limit = 10, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await fetch(`/api/admin/products?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          data: data
        };
      }

      console.log('Admin products response:', data.data);
      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      if (error.status) {
        throw error;
      } else {
        throw {
          status: 0,
          data: { message: 'Network error. Please try again.' }
        };
      }
    }
  }


  // Get single product by ID
async getProductById(productId) {
  try {
    const response = await fetch(`/api/admin/products/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        data: data
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    if (error.status) {
      throw error;
    } else {
      throw {
        status: 0,
        data: { message: 'Network error. Please try again.' }
      };
    }
  }
}

// Toggle product status (active/inactive)
async toggleProductStatus(productId, status) {
  try {
    const response = await fetch(`/api/admin/products/${productId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify({ status })
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        data: data
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    if (error.status) {
      throw error;
    } else {
      throw {
        status: 0,
        data: { message: 'Network error. Please try again.' }
      };
    }
  }
}


// Update product stock
async updateStock(productId, stock) {
  try {
    const response = await fetch(`/api/admin/products/${productId}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify({ stock })
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        data: data
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    if (error.status) {
      throw error;
    } else {
      throw {
        status: 0,
        data: { message: 'Network error. Please try again.' }
      };
    }
  }
}

// Get product analytics/stats
async getProductStats() {
  try {
    const response = await fetch('/api/admin/products/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        data: data
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    if (error.status) {
      throw error;
    } else {
      throw {
        status: 0,
        data: { message: 'Network error. Please try again.' }
      };
    }
  }

}
}

export default new ProductService();