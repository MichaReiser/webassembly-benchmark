async function loadWASMModule(fileName) {
    const response = await fetch(fileName, { cache: 'no-cache' });
    const bytes = await response.arrayBuffer();
    const compiled = await WebAssembly.compile(bytes);
    const instance = new WebAssembly.Instance(compiled, { env: { "console.log": console.log } });
    return instance;
}

function fib(num) {
    if (num <= 1) {
        return 1;
    }

    return fib(num - 1) + fib(num - 2);
}

const NUMBER = 40;

async function runBenchmark() {
    const fibModule = await loadWASMModule("./fib.wasm");
    const fibOptimized = await loadWASMModule("./fibOpt.wasm");
    const fibFullzOptimized = await loadWASMModule("./fibOpt2.wasm");
    const fibDouble = await loadWASMModule("./fibDouble.wasm");
    const fibManual = await loadWASMModule("./manual.wasm");
    const fibManualOpt = await loadWASMModule("./manual-O3.wasm");

    const suite = new Benchmark.Suite();
    suite.add("C", function () {
        fibModule.exports.fib(NUMBER);
    });

    suite.add("C with LLVM Optimization", function () {
        fibOptimized.exports.fib(NUMBER);
    });

    suite.add("C fully optimized", function () {
        fibFullzOptimized.exports.fib(NUMBER);
    });

    suite.add("C double optimized", function () {
        fibDouble.exports.fib(NUMBER);
    });
    
    suite.add("Manual", function () {
         fibManual.exports.fib(NUMBER);
    });

    suite.add("Manual O3", function () {
        fibManualOpt.exports.fib(NUMBER);
    });

    suite.add("JS", function () {
        fib(NUMBER);
    });

    suite.on("complete", function (event) {
        const benchmarks = event.currentTarget.map(benchmark => {
            return {
                info: benchmark.toString,
                name: benchmark.name,
                hz: benchmark.hz,
                count: benchmark.count,
                cycles: benchmark.cycles,
                stats: benchmark.stats,
                times: benchmark.times,
                error: benchmark.error
            };
        });

        const output = JSON.stringify({ benchmarks, platform}, undefined, "    ");
        document.querySelector("#output").textContent = output;
    });

    suite.run({ async: true });
}

document.querySelector("#run").addEventListener("click", runBenchmark);






