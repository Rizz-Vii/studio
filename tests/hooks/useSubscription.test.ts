import { renderHook, act } from "@testing-library/react-hooks";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/context/AuthContext";

// Mock the AuthContext
jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Mock Firestore functions
const mockUnsubscribe = jest.fn();
const mockOnSnapshot = jest.fn((query, callback) => {
  // Simulate a subscription update
  callback({
    docs: [
      {
        data: () => ({
          tier: "agency",
          status: "active",
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }),
      },
    ],
  });
  return mockUnsubscribe;
});

jest.mock("firebase/firestore", () => ({
  ...jest.requireActual("firebase/firestore"),
  getFirestore: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: (query, callback) => mockOnSnapshot(query, callback),
}));

describe("useSubscription Hook", () => {
  beforeEach(() => {
    // Reset mocks before each test
    (useAuth as jest.Mock).mockClear();
    mockOnSnapshot.mockClear();
    mockUnsubscribe.mockClear();
  });

  it("should not fetch subscription if user is not authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    const { result } = renderHook(() => useSubscription());

    expect(result.current.subscription).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });

  it("should fetch subscription and update loading state for an authenticated user", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: "test-user" } });

    const { result, waitForNextUpdate } = renderHook(() => useSubscription());

    // Initial state
    expect(result.current.loading).toBe(true);

    // Wait for the subscription data to be fetched
    await waitForNextUpdate();

    // Final state
    expect(result.current.loading).toBe(false);
    expect(result.current.subscription).not.toBeNull();
    expect(result.current.subscription?.tier).toBe("agency");
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
  });

  it("should handle subscription not found", async () => {
    // Mock onSnapshot to return no documents
    mockOnSnapshot.mockImplementationOnce((query, callback) => {
      callback({ docs: [] });
      return mockUnsubscribe;
    });

    (useAuth as jest.Mock).mockReturnValue({ user: { uid: "no-sub-user" } });

    const { result, waitForNextUpdate } = renderHook(() => useSubscription());

    expect(result.current.loading).toBe(true);
    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.subscription).toBeNull();
  });

  it("should clean up the subscription on unmount", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: "test-user" } });

    const { unmount } = renderHook(() => useSubscription());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it("should return the correct subscription data", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: "test-user" } });

    const { result, waitForNextUpdate } = renderHook(() => useSubscription());

    await waitForNextUpdate();

    expect(result.current.subscription).toEqual(
      expect.objectContaining({
        tier: "agency",
        status: "active",
      })
    );
  });
});
