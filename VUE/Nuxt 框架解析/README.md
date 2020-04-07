### 前言
Nuxt 作为一个服务端渲染的 VUE 框架，被广泛的使用的各个项目中，在使用这个项目的过程中，经常会有一些困惑的知识点，所以想详细的梳理一下 Nuxt 框架的基础知识。

### Nuxt 介绍
引用一段官网的介绍：
>渐进式的 Vue.js 框架
>> 你可以满怀信心地使用 NuxtJs 框架来构建你的下一代 Vue.js 应用。


其主要有以下的功能点：
- 自动的代码转换和构建(通过 webpack 和 babel)。
- 代码热更新。
- 可选择的服务端渲染或者单页面应用或者静态文件生成方式(后面会讲述这几种方式的差别)。
- 静态文件服务映射，./static/ 路径映射到 / 路径。
- 可通过 nuxt.config.js 配置项目。
- 通过 layouts/ 目录来自定义页面布局。
- 中间件支持。
- pages/ 目录的文件代码分割。
- 只加载关键的 css (页面级别)。


接下来本文将主要从以下的几方面来解析 NuxtJs
- Nuxt 构建过程，server-bundle 和 client-bundle 生成过程
- Nuxt 服务端运行时逻辑，客户端运行时逻辑
- Nuxt 中间件(Middleware)、插件(plugin) 解析。
- Nuxt 生命周期

### Nuxt 构建过程
Nuxt 在构建的时候，有两个入口文件，serve-entry 和 client-entry， 分别是服务端渲染和客户端渲染的入口文件  

![](./images/bundle.png)

其客户端入口配置如下：
```javascript
{
	"name": "client",
	"mode": "production",
	"devtool": false,
	"optimization": {
		"minimize": true,
		"minimizer": [{
			"pluginDescriptor": {
				"name": "OptimizeCssAssetsWebpackPlugin"
			},
			"options": {
				"assetProcessors": [{
					"phase": "compilation.optimize-chunk-assets",
					"regExp": {}
				}],
				"assetNameRegExp": {},
				"cssProcessorOptions": {},
				"cssProcessorPluginOptions": {}
			},
			"phaseAssetProcessors": {
				"compilation.optimize-chunk-assets": [{
					"phase": "compilation.optimize-chunk-assets",
					"regExp": {}
				}],
				"compilation.optimize-assets": [],
				"emit": []
			},
			"deleteAssetsMap": {}
		}],
		"splitChunks": {
			"chunks": "all",
			"cacheGroups": {
				"commons": {
					"test": /node_modules[\\\/](vue|vue-loader|vue-router|vuex|vue-meta|core-js|@babel\/runtime|axios|webpack|setimmediate|timers-browserify|process|regenerator-runtime|cookie|js-cookie|is-buffer|dotprop|nuxt\.js)[\\\/]/,
					"chunks": "all",
					"priority": 10,
					"name": true
				}
			},
			"automaticNameDelimiter": "."
		},
		"runtimeChunk": "single"
	},
	"output": {
		"path": "E:\\blog\\example\\nuxt-css-handle-demo\\.nuxt\\dist\\client",
		"filename": "[contenthash].js",
		"futureEmitAssets": true,
		"chunkFilename": "[contenthash].js",
		"publicPath": "/_nuxt/"
	},
	"performance": {
		"maxEntrypointSize": 1024000,
		"hints": "warning"
	},
	"module": {
		"rules": [{
			"test": {},
			"loader": "vue-loader",
			"options": {
				"transformAssetUrls": {
					"video": "src",
					"source": "src",
					"object": "src",
					"embed": "src"
				},
				"productionMode": true
			}
		}, {
			"test": {},
			"oneOf": [{
				"resourceQuery": {},
				"use": [{
					"loader": "pug-plain-loader",
					"options": {}
				}]
			}, {
				"use": ["raw-loader", {
					"loader": "pug-plain-loader",
					"options": {}
				}]
			}]
		}, {
			"test": {},
			"use": [{
				"loader": "E:\\blog\\example\\nuxt-css-handle-demo\\node_modules\\babel-loader\\lib\\index.js",
				"options": {
					"configFile": false,
					"babelrc": false,
					"cacheDirectory": false,
					"envName": "client",
					"presets": [
						["E:\\blog\\example\\nuxt-css-handle-demo\\node_modules\\@nuxt\\babel-preset-app\\src\\index.js", {}]
					]
				}
			}]
		}, {
			"test": {},
			"oneOf": [{
				"resourceQuery": {},
				"use": [{
					"loader": "vue-style-loader",
					"options": {
						"sourceMap": false
					}
				}, {
					"loader": "css-loader",
					"options": {
						"modules": {
							"localIdentName": "[local]_[hash:base64:5]"
						},
						"sourceMap": false,
						"importLoaders": 2,
						"onlyLocals": false
					}
				}, {
					"loader": "postcss-loader",
					"options": {
						"sourceMap": false,
						"plugins": [null, null, null, null],
						"order": "presetEnvAndCssnanoLast"
					}
				}]
			}, {
				"use": [{
					"loader": "vue-style-loader",
					"options": {
						"sourceMap": false
					}
				}, {
					"loader": "css-loader",
					"options": {
						"sourceMap": false,
						"importLoaders": 2,
						"onlyLocals": false
					}
				}, {
					"loader": "postcss-loader",
					"options": {
						"sourceMap": false,
						"plugins": [null, null, null, null],
						"order": "presetEnvAndCssnanoLast"
					}
				}]
			}]
		}, {
			"test": {},
			"oneOf": [{
				"resourceQuery": {},
				"use": [{
					"loader": "vue-style-loader",
					"options": {
						"sourceMap": false
					}
				}, {
					"loader": "css-loader",
					"options": {
						"modules": {
							"localIdentName": "[local]_[hash:base64:5]"
						},
						"sourceMap": false,
						"importLoaders": 2,
						"onlyLocals": false
					}
				}, {
					"loader": "postcss-loader",
					"options": {
						"sourceMap": false,
						"plugins": [null, null, null, null],
						"order": "presetEnvAndCssnanoLast"
					}
				}]
			}, {
				"use": [{
					"loader": "vue-style-loader",
					"options": {
						"sourceMap": false
					}
				}, {
					"loader": "css-loader",
					"options": {
						"sourceMap": false,
						"importLoaders": 2,
						"onlyLocals": false
					}
				}, {
					"loader": "postcss-loader",
					"options": {
						"sourceMap": false,
						"plugins": [null, null, null, null],
						"order": "presetEnvAndCssnanoLast"
					}
				}]
			}]
		}, {
			"test": {},
			"oneOf": [{
				"resourceQuery": {},
				"use": [{
					"loader": "vue-style-loader",
					"options": {
						"sourceMap": false
					}
				}, {
					"loader": "css-loader",
					"options": {
						"modules": {
							"localIdentName": "[local]_[hash:base64:5]"
						},
						"sourceMap": false,
						"importLoaders": 2,
						"onlyLocals": false
					}
				}, {
					"loader": "postcss-loader",
					"options": {
						"sourceMap": false,
						"plugins": [null, null, null, null],
						"order": "presetEnvAndCssnanoLast"
					}
				}, {
					"loader": "less-loader",
					"options": {
						"sourceMap": false
					}
				}]
			}, {
				"use": [{
					"loader": "vue-style-loader",
					"options": {
						"sourceMap": false
					}
				}, {
					"loader": "css-loader",
					"options": {
						"sourceMap": false,
						"importLoaders": 2,
						"onlyLocals": false
					}
				}, {
					"loader": "postcss-loader",
					"options": {
						"sourceMap": false,
						"plugins": [null, null, null, null],
						"order": "presetEnvAndCssnanoLast"
					}
				}, {
					"loader": "less-loader",
					"options": {
						"sourceMap": false
					}
				}]
			}]
		}, {
			"test": {},
			"oneOf": [{
				"resourceQuery": {},
				"use": [{
					"loader": "vue-style-loader",
					"options": {
						"sourceMap": false
					}
				}, {
					"loader": "css-loader",
					"options": {
						"modules": {
							"localIdentName": "[local]_[hash:base64:5]"
						},
						"sourceMap": false,
						"importLoaders": 2,
						"onlyLocals": false
					}
				}, {
					"loader": "postcss-loader",
					"options": {
						"sourceMap": false,
						"plugins": [null, null, null, null],
						"order": "presetEnvAndCssnanoLast"
					}
				}, {
					"loader": "sass-loader",
					"options": {
						"sassOptions": {
							"indentedSyntax": true
						},
						"sourceMap": false
					}
				}]
			}, {
				"use": [{
					"loader": "vue-style-loader",
					"options": {
						"sourceMap": false
					}
				}, {
					"loader": "css-loader",
					"options": {
						"sourceMap": false,
						"importLoaders": 2,
						"onlyLocals": false
					}
				}, {
					"loader": "postcss-loader",
					"options": {
						"sourceMap": false,
						"plugins": [null, null, null, null],
						"order": "presetEnvAndCssnanoLast"
					}
				}, {
					"loader": "sass-loader",
					"options": {
						"sassOptions": {
							"indentedSyntax": true
						},
						"sourceMap": false
					}
				}]
			}]
		}, {
			"test": {},
			"oneOf": [{
				"resourceQuery": {},
				"use": [{
					"loader": "vue-style-loader",
					"options": {
						"sourceMap": false
					}
				}, {
					"loader": "css-loader",
					"options": {
						"modules": {
							"localIdentName": "[local]_[hash:base64:5]"
						},
						"sourceMap": false,
						"importLoaders": 2,
						"onlyLocals": false
					}
				}, {
					"loader": "postcss-loader",
					"options": {
						"sourceMap": false,
						"plugins": [null, null, null, null],
						"order": "presetEnvAndCssnanoLast"
					}
				}, {
					"loader": "sass-loader",
					"options": {
						"sourceMap": false
					}
				}]
			}, {
				"use": [{
					"loader": "vue-style-loader",
					"options": {
						"sourceMap": false
					}
				}, {
					"loader": "css-loader",
					"options": {
						"sourceMap": false,
						"importLoaders": 2,
						"onlyLocals": false
					}
				}, {
					"loader": "postcss-loader",
					"options": {
						"sourceMap": false,
						"plugins": [null, null, null, null],
						"order": "presetEnvAndCssnanoLast"
					}
				}, {
					"loader": "sass-loader",
					"options": {
						"sourceMap": false
					}
				}]
			}]
		}, {
			"test": {},
			"oneOf": [{
				"resourceQuery": {},
				"use": [{
					"loader": "vue-style-loader",
					"options": {
						"sourceMap": false
					}
				}, {
					"loader": "css-loader",
					"options": {
						"modules": {
							"localIdentName": "[local]_[hash:base64:5]"
						},
						"sourceMap": false,
						"importLoaders": 2,
						"onlyLocals": false
					}
				}, {
					"loader": "postcss-loader",
					"options": {
						"sourceMap": false,
						"plugins": [null, null, null, null],
						"order": "presetEnvAndCssnanoLast"
					}
				}, {
					"loader": "stylus-loader",
					"options": {
						"sourceMap": false
					}
				}]
			}, {
				"use": [{
					"loader": "vue-style-loader",
					"options": {
						"sourceMap": false
					}
				}, {
					"loader": "css-loader",
					"options": {
						"sourceMap": false,
						"importLoaders": 2,
						"onlyLocals": false
					}
				}, {
					"loader": "postcss-loader",
					"options": {
						"sourceMap": false,
						"plugins": [null, null, null, null],
						"order": "presetEnvAndCssnanoLast"
					}
				}, {
					"loader": "stylus-loader",
					"options": {
						"sourceMap": false
					}
				}]
			}]
		}, {
			"test": {},
			"use": [{
				"loader": "url-loader",
				"options": {
					"limit": 1000,
					"name": "img/[contenthash:7].[ext]"
				}
			}]
		}, {
			"test": {},
			"use": [{
				"loader": "url-loader",
				"options": {
					"limit": 1000,
					"name": "fonts/[contenthash:7].[ext]"
				}
			}]
		}, {
			"test": {},
			"use": [{
				"loader": "file-loader",
				"options": {
					"name": "videos/[contenthash:7].[ext]"
				}
			}]
		}]
	},
	"plugins": [{}, {}, {
		"profile": false,
		"modulesCount": 500,
		"showEntries": false,
		"showModules": true,
		"showActiveModules": true,
		"options": {
			"name": "client",
			"color": "green",
			"reporters": ["basic", "fancy", "profile", "stats"],
			"reporter": {},
			"basic": false,
			"fancy": true,
			"profile": false,
			"stats": {
				"excludeAssets": [{}, {}, {}]
			}
		},
		"reporters": [{}, {
			"options": {
				"chunks": false,
				"children": false,
				"modules": false,
				"colors": true,
				"warnings": true,
				"errors": true,
				"excludeAssets": [{}, {}, {}]
			}
		}, {}]
	}, {
		"options": {
			"template": "E:\\blog\\example\\nuxt-css-handle-demo\\.nuxt\\views\\app.template.html",
			"filename": "../server/index.ssr.html",
			"hash": false,
			"inject": false,
			"compile": true,
			"favicon": false,
			"minify": {
				"collapseBooleanAttributes": true,
				"decodeEntities": true,
				"minifyCSS": true,
				"minifyJS": true,
				"processConditionalComments": true,
				"removeEmptyAttributes": true,
				"removeRedundantAttributes": true,
				"trimCustomFragments": true,
				"useShortDoctype": true
			},
			"cache": true,
			"showErrors": true,
			"chunks": "all",
			"excludeChunks": [],
			"chunksSortMode": "auto",
			"meta": {},
			"title": "Webpack App",
			"xhtml": false
		}
	}, {
		"options": {
			"template": "E:\\blog\\example\\nuxt-css-handle-demo\\.nuxt\\views\\app.template.html",
			"filename": "../server/index.spa.html",
			"hash": false,
			"inject": true,
			"compile": true,
			"favicon": false,
			"minify": {
				"collapseBooleanAttributes": true,
				"decodeEntities": true,
				"minifyCSS": true,
				"minifyJS": true,
				"processConditionalComments": true,
				"removeEmptyAttributes": true,
				"removeRedundantAttributes": true,
				"trimCustomFragments": true,
				"useShortDoctype": true
			},
			"cache": true,
			"showErrors": true,
			"chunks": "all",
			"excludeChunks": [],
			"chunksSortMode": "dependency",
			"meta": {},
			"title": "Webpack App",
			"xhtml": false
		}
	}, {
		"options": {
			"filename": "../server/client.manifest.json"
		}
	}, {
		"definitions": {
			"process.env.NODE_ENV": "\"production\"",
			"process.mode": "\"production\"",
			"process.static": false,
			"process.env.VUE_ENV": "\"client\"",
			"process.browser": true,
			"process.client": true,
			"process.server": false,
			"process.modern": false
		}
	}, {}],
	"entry": {
		"app": ["E:\\blog\\example\\nuxt-css-handle-demo\\.nuxt\\client.js"]
	}
}
```







