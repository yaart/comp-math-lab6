package yaart.s468198.service;

import org.springframework.stereotype.Service;
import yaart.s468198.dto.*;
import yaart.s468198.model.DifferentialEquation;

import java.util.ArrayList;
import java.util.List;

@Service
public class OdeSolverService {

    private final List<DifferentialEquation> equations = List.of(
            new DifferentialEquation(1, "y' = y * cos(x)",
                    (x, y) -> y * Math.cos(x),
                    (x, x0, y0) -> {
                        return y0 * Math.exp(Math.sin(x) - Math.sin(x0));
                    }),
            new DifferentialEquation(2, "y' = x² - 2y",
                    (x, y) -> x * x - 2 * y,
                    (x, x0, y0) -> {
                        double c = (y0 - 0.5 * x0 * x0 + 0.5 * x0 - 0.25) * Math.exp(2 * x0);
                        return 0.5 * x * x - 0.5 * x + 0.25 + c * Math.exp(-2 * x);
                    }),
            new DifferentialEquation(3, "y' = sin(x) + y",
                    (x, y) -> Math.sin(x) + y,
                    (x, x0, y0) -> {
                        double c = (y0 + 0.5 * (Math.sin(x0) + Math.cos(x0))) / Math.exp(x0);
                        return c * Math.exp(x) - 0.5 * (Math.sin(x) + Math.cos(x));
                    })
    );

    public List<DifferentialEquation> getEquations() {
        return equations;
    }

    public List<OdeResult> solve(OdeRequest req) {
        DifferentialEquation eq = equations.get(req.equationId() - 1);

        List<OdeResult> results = new ArrayList<>();
        results.add(solveWithRungeRule(eq, req, "Метод Эйлера (усов.)", 2));
        results.add(solveWithRungeRule(eq, req, "Метод Рунге-Кутта 4", 4));
        results.add(solveMilne(eq, req));

        return results.stream().map(res -> {
            List<OdePoint> pointsWithExact = res.points().stream()
                    .map(p -> new OdePoint(p.x(), p.y(), eq.exactSolution().apply(p.x(), req.x0(), req.y0())))
                    .toList();
            return new OdeResult(res.methodName(), pointsWithExact, res.errorRunge(), calculateMaxError(pointsWithExact));
        }).toList();
    }

    private OdeResult solveWithRungeRule(DifferentialEquation eq, OdeRequest req, String method, int p) {
        List<OdePoint> p1 = (p == 2) ? runImprovedEuler(eq, req, req.h()) : runRK4(eq, req, req.h());
        List<OdePoint> p2 = (p == 2) ? runImprovedEuler(eq, req, req.h() / 2) : runRK4(eq, req, req.h() / 2);

        double yH = p1.get(p1.size() - 1).y();
        double yH2 = p2.get(p2.size() - 1).y();
        double rungeError = Math.abs(yH - yH2) / (Math.pow(2, p) - 1);

        return new OdeResult(method, p1, rungeError, 0);
    }

    private List<OdePoint> runImprovedEuler(DifferentialEquation eq, OdeRequest req, double h) {
        List<OdePoint> points = new ArrayList<>();
        double x = req.x0(), y = req.y0();
        while (x <= req.xn() + h / 10) {
            validate(y);
            points.add(new OdePoint(x, y, 0));
            double k1 = h * eq.function().apply(x, y);
            double k2 = h * eq.function().apply(x + h, y + k1);
            y += 0.5 * (k1 + k2);
            x += h;
        }
        return points;
    }

    private List<OdePoint> runRK4(DifferentialEquation eq, OdeRequest req, double h) {
        List<OdePoint> points = new ArrayList<>();
        double x = req.x0(), y = req.y0();
        while (x <= req.xn() + h / 10) {
            validate(y);
            points.add(new OdePoint(x, y, 0));
            double k1 = h * eq.function().apply(x, y);
            double k2 = h * eq.function().apply(x + h / 2, y + k1 / 2);
            double k3 = h * eq.function().apply(x + h / 2, y + k2 / 2);
            double k4 = h * eq.function().apply(x + h, y + k3);
            y += (k1 + 2 * k2 + 2 * k3 + k4) / 6.0;
            x += h;
        }
        return points;
    }

    private OdeResult solveMilne(DifferentialEquation eq, OdeRequest req) {
        double h = req.h();
        List<OdePoint> res = runRK4(eq, new OdeRequest(0, req.x0(), req.y0(), req.x0() + 3 * h, h, 0), h);

        for (int i = 3; res.get(i).x() < req.xn() - h / 10; i++) {
            double xNext = res.get(i).x() + h;
            double yP = res.get(i - 3).y() + (4 * h / 3.0) * (
                    2 * eq.function().apply(res.get(i - 2).x(), res.get(i - 2).y()) -
                            eq.function().apply(res.get(i - 1).x(), res.get(i - 1).y()) +
                            2 * eq.function().apply(res.get(i).x(), res.get(i).y())
            );
            double yC = yP;
            for (int j = 0; j < 50; j++) {
                double lastYC = yC;
                yC = res.get(i - 1).y() + (h / 3.0) * (
                        eq.function().apply(res.get(i - 1).x(), res.get(i - 1).y()) +
                                4 * eq.function().apply(res.get(i).x(), res.get(i).y()) +
                                eq.function().apply(xNext, lastYC)
                );
                if (Math.abs(yC - lastYC) < req.epsilon()) {
                    break;
                }
            }
            validate(yC);
            res.add(new OdePoint(xNext, yC, 0));
        }
        return new OdeResult("Метод Милна", res, 0, 0);
    }

    private void validate(double val) {
        if (Double.isNaN(val) || Double.isInfinite(val)) {
            throw new ArithmeticException("Решение ОДУ расходится или вышло за пределы допустимых значений вычислительной машины");
        }
    }

    private double calculateMaxError(List<OdePoint> points) {
        return points.stream().mapToDouble(p -> Math.abs(p.y() - p.yExact())).max().orElse(0);
    }

    public double[] solveSweep(SweepRequest request) {
        double[] a = request.a();
        double[] c = request.c();
        double[] b = request.b();
        double[] f = request.f();

        int n = c.length;

        if (f.length != n || a.length != n || b.length != n) {
            throw new IllegalArgumentException("Размерности векторов трехдиагональной матрицы и правой части не совпадают");
        }

        for (int i = 0; i < n; i++) {
            double aa = (i == 0) ? 0 : Math.abs(a[i]);
            double bb = (i == n - 1) ? 0 : Math.abs(b[i]);
            if (Math.abs(c[i]) < aa + bb) {
                throw new ArithmeticException("Условие устойчивости алгоритма нарушено в строке " + (i + 1) +
                        ": элемент главной диагонали по модулю меньше суммы соседних элементов.");
            }
        }

        double[] alpha = new double[n];
        double[] beta = new double[n];
        double[] x = new double[n];

        if (c[0] == 0) {
            throw new ArithmeticException("Деление на ноль в начале прямого хода: элемент главной диагонали c[0] равен 0. Метод прогонки неприменим.");
        }
        alpha[0] = -b[0] / c[0];
        beta[0] = f[0] / c[0];

        for (int i = 1; i < n - 1; i++) {
            double denominator = c[i] + a[i] * alpha[i - 1];
            if (denominator == 0) {
                throw new ArithmeticException("Деление на ноль при вычислении прогоночных коэффициентов в узле " + (i + 1));
            }
            alpha[i] = -b[i] / denominator;
            beta[i] = (f[i] - a[i] * beta[i - 1]) / denominator;
        }

        double lastDenominator = c[n - 1] + a[n - 1] * alpha[n - 2];
        if (lastDenominator == 0) {
            throw new ArithmeticException("Деление на ноль в конечной точке прямого хода прогоночного алгоритма");
        }
        beta[n - 1] = (f[n - 1] - a[n - 1] * beta[n - 2]) / lastDenominator;

        x[n - 1] = beta[n - 1];
        for (int i = n - 2; i >= 0; i--) {
            x[i] = alpha[i] * x[i + 1] + beta[i];
        }

        return x;
    }
}