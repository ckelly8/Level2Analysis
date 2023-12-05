def calculate_center_of_mass(ob_array):
    distances = ob_array[:, 0]
    masses = ob_array[:, 1]
    total_mass = np.sum(masses)
    center_of_mass = np.sum(distances * masses) / total_mass
    return center_of_mass