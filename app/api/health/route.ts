import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  checks: {
    database: HealthCheckResult;
    storage: HealthCheckResult;
    external_apis: HealthCheckResult;
    memory: HealthCheckResult;
  };
  metrics: {
    response_time_ms: number;
    memory_usage_mb: number;
    cpu_usage_percent: number;
  };
}

interface HealthCheckResult {
  status: 'pass' | 'fail' | 'warn';
  message: string;
  response_time_ms?: number;
  details?: Record<string, any>;
}

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Initialize health check response
    const healthCheck: HealthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks: {
        database: await checkDatabase(),
        storage: await checkStorage(),
        external_apis: await checkExternalAPIs(),
        memory: checkMemory(),
      },
      metrics: {
        response_time_ms: 0,
        memory_usage_mb: 0,
        cpu_usage_percent: 0,
      },
    };

    // Calculate metrics
    healthCheck.metrics.response_time_ms = Date.now() - startTime;
    healthCheck.metrics.memory_usage_mb = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    
    // Determine overall status
    const checkStatuses = Object.values(healthCheck.checks).map(check => check.status);
    
    if (checkStatuses.includes('fail')) {
      healthCheck.status = 'unhealthy';
    } else if (checkStatuses.includes('warn')) {
      healthCheck.status = 'degraded';
    }

    // Return appropriate HTTP status
    const httpStatus = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503;

    return NextResponse.json(healthCheck, { status: httpStatus });

  } catch (error) {
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      response_time_ms: Date.now() - startTime,
    };

    return NextResponse.json(errorResponse, { status: 503 });
  }
}

async function checkDatabase(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Test basic connectivity
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      return {
        status: 'fail',
        message: `Database connection failed: ${error.message}`,
        response_time_ms: Date.now() - startTime,
        details: { error_code: error.code }
      };
    }

    // Test write capability (optional)
    const writeTest = await supabase
      .from('system_logs')
      .insert({
        level: 'info',
        message: 'Health check test',
        component: 'health-check',
        timestamp: new Date().toISOString(),
      });

    const responseTime = Date.now() - startTime;

    if (responseTime > 5000) {
      return {
        status: 'warn',
        message: 'Database responding slowly',
        response_time_ms: responseTime,
      };
    }

    return {
      status: 'pass',
      message: 'Database connection healthy',
      response_time_ms: responseTime,
    };

  } catch (error) {
    return {
      status: 'fail',
      message: `Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      response_time_ms: Date.now() - startTime,
    };
  }
}

async function checkStorage(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Test storage connectivity
    const { data, error } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'hydrogen-data')
      .list('', { limit: 1 });

    if (error) {
      return {
        status: 'fail',
        message: `Storage connection failed: ${error.message}`,
        response_time_ms: Date.now() - startTime,
      };
    }

    return {
      status: 'pass',
      message: 'Storage connection healthy',
      response_time_ms: Date.now() - startTime,
    };

  } catch (error) {
    return {
      status: 'fail',
      message: `Storage health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      response_time_ms: Date.now() - startTime,
    };
  }
}

async function checkExternalAPIs(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Check if external APIs are configured and accessible
    const checks = [];

    // Example: Weather API check (if configured)
    if (process.env.OPENWEATHER_API_KEY) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${process.env.OPENWEATHER_API_KEY}`,
          { signal: AbortSignal.timeout(5000) }
        );
        
        checks.push({
          service: 'OpenWeather API',
          status: response.ok ? 'pass' : 'fail',
          response_code: response.status,
        });
      } catch (error) {
        checks.push({
          service: 'OpenWeather API',
          status: 'fail',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // If no external APIs configured, return pass
    if (checks.length === 0) {
      return {
        status: 'pass',
        message: 'No external APIs configured',
        response_time_ms: Date.now() - startTime,
      };
    }

    // Determine overall external API status
    const failedChecks = checks.filter(check => check.status === 'fail');
    
    if (failedChecks.length === checks.length) {
      return {
        status: 'fail',
        message: 'All external APIs failed',
        response_time_ms: Date.now() - startTime,
        details: { checks },
      };
    } else if (failedChecks.length > 0) {
      return {
        status: 'warn',
        message: 'Some external APIs failed',
        response_time_ms: Date.now() - startTime,
        details: { checks },
      };
    }

    return {
      status: 'pass',
      message: 'All external APIs healthy',
      response_time_ms: Date.now() - startTime,
      details: { checks },
    };

  } catch (error) {
    return {
      status: 'fail',
      message: `External API health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      response_time_ms: Date.now() - startTime,
    };
  }
}

function checkMemory(): HealthCheckResult {
  try {
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const memoryLimitMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const memoryPercentage = (memoryUsageMB / memoryLimitMB) * 100;

    let status: 'pass' | 'warn' | 'fail' = 'pass';
    let message = 'Memory usage normal';

    if (memoryPercentage > 90) {
      status = 'fail';
      message = 'Critical memory usage';
    } else if (memoryPercentage > 75) {
      status = 'warn';
      message = 'High memory usage';
    }

    return {
      status,
      message,
      details: {
        heap_used_mb: memoryUsageMB,
        heap_total_mb: memoryLimitMB,
        usage_percentage: Math.round(memoryPercentage),
        rss_mb: Math.round(memoryUsage.rss / 1024 / 1024),
        external_mb: Math.round(memoryUsage.external / 1024 / 1024),
      },
    };

  } catch (error) {
    return {
      status: 'fail',
      message: `Memory check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Detailed health check endpoint
export async function POST() {
  const startTime = Date.now();
  
  try {
    // Perform more comprehensive checks for detailed health report
    const detailedHealth = {
      timestamp: new Date().toISOString(),
      detailed_checks: {
        database_tables: await checkDatabaseTables(),
        storage_buckets: await checkStorageBuckets(),
        system_resources: getSystemResources(),
        recent_errors: await getRecentErrors(),
        performance_metrics: await getPerformanceMetrics(),
      },
      response_time_ms: Date.now() - startTime,
    };

    return NextResponse.json(detailedHealth);

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Detailed health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

async function checkDatabaseTables() {
  try {
    const tables = [
      'profiles',
      'production_facilities',
      'storage_facilities',
      'transport_routes',
      'notifications',
      'audit_logs',
    ];

    const tableChecks = await Promise.all(
      tables.map(async (table) => {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

          return {
            table,
            status: error ? 'fail' : 'pass',
            count: count || 0,
            error: error?.message,
          };
        } catch (error) {
          return {
            table,
            status: 'fail',
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    return tableChecks;
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function checkStorageBuckets() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      return { status: 'fail', error: error.message };
    }

    return {
      status: 'pass',
      buckets: buckets?.map(bucket => ({
        name: bucket.name,
        public: bucket.public,
        created_at: bucket.created_at,
      })) || [],
    };
  } catch (error) {
    return { 
      status: 'fail', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

function getSystemResources() {
  const memoryUsage = process.memoryUsage();
  
  return {
    memory: {
      heap_used_mb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heap_total_mb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      rss_mb: Math.round(memoryUsage.rss / 1024 / 1024),
      external_mb: Math.round(memoryUsage.external / 1024 / 1024),
    },
    uptime_seconds: process.uptime(),
    node_version: process.version,
    platform: process.platform,
    arch: process.arch,
  };
}

async function getRecentErrors() {
  try {
    const { data, error } = await supabase
      .from('system_logs')
      .select('level, message, component, timestamp')
      .eq('level', 'error')
      .order('timestamp', { ascending: false })
      .limit(10);

    if (error) {
      return { status: 'fail', error: error.message };
    }

    return {
      status: 'pass',
      recent_errors: data || [],
      count: data?.length || 0,
    };
  } catch (error) {
    return { 
      status: 'fail', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function getPerformanceMetrics() {
  try {
    const { data, error } = await supabase
      .from('performance_metrics')
      .select('metric_name, value, unit, timestamp')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      return { status: 'fail', error: error.message };
    }

    return {
      status: 'pass',
      metrics: data || [],
      count: data?.length || 0,
    };
  } catch (error) {
    return { 
      status: 'fail', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
