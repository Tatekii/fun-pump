module.exports = (api) => {
	api.cache(true)
	return {
		presets: [["babel-preset-expo", { jsxRuntime: "automatic", unstable_transformImportMeta: true }]],
	}
}
