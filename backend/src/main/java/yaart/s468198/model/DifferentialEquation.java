package yaart.s468198.model;

import java.util.function.BiFunction;

public record DifferentialEquation(
        int id,
        String formula,
        BiFunction<Double, Double, Double> function,
        AnalyticalSolution exactSolution
) {
    @FunctionalInterface
    public interface AnalyticalSolution {
        double apply(double x, double x0, double y0);
    }
}