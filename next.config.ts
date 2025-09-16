import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	output: "standalone",
	eslint: {
		ignoreDuringBuilds: true,
	},
	// Otimizações de performance
	compress: true,
	poweredByHeader: false,
	reactStrictMode: true,

	// i18n - Next.js nativo
	i18n: {
		locales: ["pt-BR", "en-US", "es-ES"],
		defaultLocale: "pt-BR",
		localeDetection: false,
	},

	// Otimização de imagens
	images: {
		formats: ['image/webp', 'image/avif'],
		minimumCacheTTL: 60,
	},

	// Otimização experimental
	experimental: {
		optimizeCss: true,
		scrollRestoration: true,
	},

	webpack: (config: any) => {
		// Desabilitar source maps em produção para performance
		if (process.env.NODE_ENV === 'production') {
			config.devtool = false;
		}

		config.module.rules.forEach((rule: any) => {
			if (rule.test && rule.test.toString().includes('css')) {
				if (rule.use) {
					rule.use.forEach((use: any) => {
						if (use.loader && use.loader.includes('css-loader')) {
							use.options = {
								...use.options,
								sourceMap: false,
							};
						}
					});
				}
			}
		});

		// Otimizações adicionais do webpack
		config.optimization = {
			...config.optimization,
			splitChunks: {
				chunks: 'all',
				cacheGroups: {
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						name: 'vendors',
						chunks: 'all',
					},
				},
			},
		};

		return config;
	},
};

export default nextConfig;
