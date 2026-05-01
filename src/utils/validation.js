/**
 * Validates ticket creation input data
 * @param {Object} data - The ticket data to validate
 * @param {string} data.student_email - Student email address
 * @param {string} data.student_name - Student name
 * @param {string} data.department_id - Department UUID
 * @returns {{ isValid: boolean, errors: Object }} Validation result
 */
export const validateTicketInput = (data) => {
    const errors = {};

    if (!data.student_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.student_email)) {
        errors.email = 'Invalid email address';
    }

    if (!data.student_name || data.student_name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
    }

    if (!data.department_id) {
        errors.department = 'Department is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validates a staff access request
 * @param {Object} data - The request data to validate
 * @returns {{ isValid: boolean, errors: Object }} Validation result
 */
export const validateStaffRequest = (data) => {
    const errors = {};

    if (!data.full_name || data.full_name.trim().length < 2) {
        errors.full_name = 'Full name must be at least 2 characters';
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Invalid email address';
    }

    if (!data.department) {
        errors.department = 'Department is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

