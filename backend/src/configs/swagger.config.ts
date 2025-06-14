import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { Express } from 'express';

export const setupSwagger = (app: Express): void => {
  try {
    // Load the main swagger YAML file
    const swaggerDocument = YAML.load(path.join(process.cwd(), 'swagger/docs/swagger.yaml'));
    
    // Load UI configuration
    const swaggerConfigPath = path.join(process.cwd(), 'swagger/docs/swagger-config.json');
    let swaggerConfig = {};
    
    try {
      swaggerConfig = require(swaggerConfigPath);
    } catch (error) {
      console.log('Using default Swagger UI configuration');
    }
    
    // Setup Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      customCss: (swaggerConfig as any).customCss || '',
      customSiteTitle: (swaggerConfig as any).title || 'Student Management System API',
      explorer: true,
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
        ...(swaggerConfig as any).swaggerOptions
      }
    }));

    // Serve raw swagger JSON
    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerDocument);
    });

    console.log('✅ Swagger documentation available at /api-docs');
  } catch (error) {
    console.error('❌ Failed to setup Swagger:', error);
  }
}; 