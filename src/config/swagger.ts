import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CommerceFlow API',
      version: '1.0.0',
      description: 'Production-grade e-commerce backend with Stripe payments, BullMQ queues, and Redis caching.',
      contact: { name: 'CommerceFlow' },
    },
    servers: [
      { url: '/api/v1', description: 'API v1' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            code: { type: 'string' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'CUSTOMER'] },
            isEmailVerified: { type: 'boolean' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            basePrice: { type: 'number' },
            sku: { type: 'string' },
            category: { '$ref': '#/components/schemas/Category' },
            images: { type: 'array', items: { type: 'object' } },
            averageRating: { type: 'number' },
            reviewCount: { type: 'integer' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            orderNumber: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'] },
            grandTotal: { type: 'number' },
            items: { type: 'array' },
            payments: { type: 'array' },
          },
        },
      },
    },
    paths: {
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' }, firstName: { type: 'string' }, lastName: { type: 'string' } } } } } },
          responses: { '201': { description: 'User registered' } },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } } },
          responses: { '200': { description: 'Login successful' } },
        },
      },
      '/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh access token',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } } } },
          responses: { '200': { description: 'Token refreshed' } },
        },
      },
      '/products': {
        get: {
          tags: ['Products'],
          summary: 'List products',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'categoryId', in: 'query', schema: { type: 'string' } },
            { name: 'minPrice', in: 'query', schema: { type: 'number' } },
            { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['name', 'basePrice', 'createdAt', 'rating'] } },
            { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
          ],
          responses: { '200': { description: 'Products list' } },
        },
        post: {
          tags: ['Products'],
          summary: 'Create product (Admin)',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, basePrice: { type: 'number' }, sku: { type: 'string' }, categoryId: { type: 'string' } } } } } },
          responses: { '201': { description: 'Product created' } },
        },
      },
      '/products/{idOrSlug}': {
        get: {
          tags: ['Products'],
          summary: 'Get product by ID or slug',
          parameters: [{ name: 'idOrSlug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Product details' } },
        },
      },
      '/cart': {
        get: {
          tags: ['Cart'],
          summary: 'Get cart',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Cart with items' } },
        },
      },
      '/cart/items': {
        post: {
          tags: ['Cart'],
          summary: 'Add item to cart',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { productId: { type: 'string' }, quantity: { type: 'integer' } } } } } },
          responses: { '201': { description: 'Item added' } },
        },
      },
      '/orders/checkout': {
        post: {
          tags: ['Orders'],
          summary: 'Checkout (place order)',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { shippingAddressId: { type: 'string' }, couponCode: { type: 'string' } } } } } },
          responses: { '201': { description: 'Order created' } },
        },
      },
      '/orders': {
        get: {
          tags: ['Orders'],
          summary: 'Get user orders',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { '200': { description: 'Orders list' } },
        },
      },
      '/payments/create-payment-intent': {
        post: {
          tags: ['Payments'],
          summary: 'Create Stripe payment intent',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { orderId: { type: 'string' } } } } } },
          responses: { '200': { description: 'Payment intent created' } },
        },
      },
      '/payments/webhook': {
        post: {
          tags: ['Payments'],
          summary: 'Stripe webhook handler',
          responses: { '200': { description: 'Webhook received' } },
        },
      },
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Basic health check',
          responses: { '200': { description: 'OK' } },
        },
      },
      '/health/ready': {
        get: {
          tags: ['Health'],
          summary: 'Readiness check (DB + Redis)',
          responses: { '200': { description: 'Ready' }, '503': { description: 'Not ready' } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
