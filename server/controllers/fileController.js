const zlib = require('zlib');
const User = require('../models/userModel');
const File = require('../models/fileModel');
const PaymentDetails = require('../models/PaymentDetailsModel');
const { generateInProgressEmail, generateProcessedEmail } = require('../utils/emailTemplate');
const nodemailer = require('nodemailer');

require('dotenv').config();

const Auth_email = process.env.AUTH_EMAIL || 'deizyexpress@gmail.com';
const Auth_Password = process.env.AUTH_PASSWORD || 'usykstcamwpujyvp';

// NODEMAILER TRANSPORTER
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: Auth_email,
        pass: Auth_Password,
    },
});


exports.uploadFile = async (req, res) => {
    const userId = req.user._id;
    const { name, paymentId } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
        const payment = await PaymentDetails.findOne({
            _id: paymentId,
            isPending: true
        });

        if (!payment) return res.status(400).json({ message: 'Invalid payment' });

        // Check file size limit (e.g., 5MB)
        if (req.file.size > 5 * 1024 * 1024) {
            return res.status(400).json({ message: 'File size exceeds the limit of 5MB.' });
        }

        // Compress the file data
        const compressedData = zlib.gzipSync(req.file.buffer);

        // Create a new file document with the paymentId
        const file = new File({
            user: userId,
            fileName: name,
            fileData: compressedData,
            uploadedAt: new Date(),
            status: 'not processed',
            paymentId: paymentId,
        });

        // Save the file
        await file.save();

        await PaymentDetails.findByIdAndUpdate(paymentId, { isPending: false });

        // Increment fileUploadCount in the User model
        await User.findByIdAndUpdate(
            userId,
            { $inc: { fileUploadCount: 1 } },
            { new: true }
        );

        return res.status(201).json({
            status: 'success',
            message: 'File uploaded and saved successfully.',
            file: {
                _id: file._id,
                fileName: file.fileName,
                uploadedAt: file.uploadedAt,
                status: file.status,
                paymentId: file.paymentId,
            },
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.getUserFiles = async (req, res) => {
    const userId = req.user._id;
    try {
        // Populate the paymentId field so that it returns the full PaymentDetails document.
        const files = await File.find({ user: userId })
            .select('-fileData')
            .populate('paymentId');
        return res.status(200).json({
            status: 'success',
            files,
        });
    } catch (error) {
        console.error('Error fetching user files:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};


exports.getFileUploadCount = async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId).select('fileUploadCount ProcessedDocument');

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found.'
            });
        }

        return res.status(200).json({
            status: 'success',
            fileUploadCount: user.fileUploadCount,
            ProcessedDocument: user.ProcessedDocument,
        });
    } catch (error) {
        console.error('Error fetching file upload count:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error.'
        });
    }
};

exports.downloadFileForUser = async (req, res) => {
    const { fileId } = req.params;

    try {
        // Find the file by its ID and ensure it has been processed
        const file = await File.findById(fileId);

        if (!file || file.status !== "processed") {
            return res.status(404).json({ message: "File not found or not processed." });
        }

        // Decompress the file data before sending it
        const decompressedData = zlib.gunzipSync(file.fileData);

        // Set the appropriate headers for downloading the file
        res.setHeader("Content-Disposition", `attachment; filename=${file.fileName}`);
        res.setHeader("Content-Type", "application/octet-stream");
        res.send(decompressedData);
    } catch (error) {
        console.error("Error downloading file:", error);
        res.status(500).json({ message: "Failed to download file." });
    }
};

// Controller to fetch platform usage metrics
exports.getPlatformUsageMetrics = async (req, res) => {
    try {
        // Aggregate the total counts for ProcessedDocument and fileUploadCount
        const metrics = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalProcessedDocuments: { $sum: "$ProcessedDocument" },
                    totalFileUploadCount: { $sum: "$fileUploadCount" },
                },
            },
        ]);

        // Fetch the total number of users
        const totalUsers = await User.countDocuments();

        // Ensure metrics exist even if there are no users
        const {
            totalProcessedDocuments = 0,
            totalFileUploadCount = 0,
        } = metrics[0] || {};

        return res.status(200).json({
            status: "success",
            data: {
                totalProcessedDocuments,
                totalFileUploadCount,
                totalUsers,
            },
        });
    } catch (error) {
        console.error("Error fetching platform usage metrics:", error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error.",
        });
    }
};

// Controller to fetch all users
exports.getAllUsers = async (req, res) => {
    try {
        // Fetch all users and select the required fields
        const users = await User.find()
            .select('userName email role fileUploadCount');

        return res.status(200).json({
            status: 'success',
            data: users,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error.',
        });
    }
};

exports.getdownloadById = async (req, res) => {
    const { fileId } = req.params;

    try {
        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ message: 'File not found.' });
        }

        const decompressedData = zlib.gunzipSync(file.fileData);

        res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        return res.status(200).send(decompressedData);
    } catch (error) {
        console.error('Error downloading file:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}



exports.getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id).select('userName email role fileUploadCount');

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found.',
            });
        }

        return res.status(200).json({
            status: 'success',
            data: user,
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error.',
        });
    }
};


// Controller to fetch details of a single user by ID
exports.getUserByIdWithFiles = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id).select('userName email role fileUploadCount');
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found.',
            });
        }

        // Fetch files and populate the paymentId field
        const files = await File.find({ user: id })
            .select('-fileData')
            .populate('paymentId'); // Populate paymentId with PaymentDetails

        return res.status(200).json({
            status: 'success',
            data: {
                user,
                files,
            },
        });
    } catch (error) {
        console.error('Error fetching user details with files:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error.',
        });
    }
};

exports.getUsersWithDocuments = async (req, res) => {
    try {
        // Aggregate users who have at least one file attached
        const usersWithFiles = await File.aggregate([
            {
                // Lookup to join User model with File model based on the user field
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails',
                },
            },
            {
                // Unwind the userDetails to get individual user data per file
                $unwind: '$userDetails',
            },
            {
                // Group by user ID, gathering all their files and related data
                $group: {
                    _id: '$user',
                    userName: { $first: '$userDetails.userName' },
                    files: {
                        $push: {  // Collect files for each user
                            fileName: '$fileName',
                            uploadedAt: '$uploadedAt',
                            status: '$status',
                        },
                    },
                },
            },
            {
                // Optionally, filter out users who have no files (if needed)
                $match: {
                    'files.0': { $exists: true },
                },
            },
        ]);

        return res.status(200).json({
            status: 'success',
            data: usersWithFiles,
        });
    } catch (error) {
        console.error('Error fetching users with documents:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error.',
        });
    }
};

exports.updateFileStatus = async (req, res) => {
    const { fileId } = req.params;
    const { status } = req.body;

    if (!['not processed', 'in process', 'processed'].includes(status)) {
        return res.status(400).json({ status: 'error', message: 'Invalid status.' });
    }

    try {
        const file = await File.findById(fileId);
        if (!file) {
            return res.status(404).json({ status: 'error', message: 'File not found.' });
        }

        const now = new Date();
        let sendEmail = false;

        // Check if status is changing to 'in process' and inProgress is false
        if (status === 'in process' && file.inProgress === false) {
            sendEmail = true;
        }

        // Update file properties based on status
        file.status = status;

        if (status === 'in process') {
            file.statusInProgressTime = now;

            if (now.getDay() === 6) { // Saturday
                file.timeFrame = 'saturday';
            } else {
                const hour = now.getHours();
                if (hour >= 7 && hour < 11) file.timeFrame = 'morning';
                else if (hour >= 18 && hour < 22) file.timeFrame = 'evening';
                else if (hour >= 0 && hour < 7) file.timeFrame = 'new day';
            }
        } else if (status === 'processed') {
            file.statusProcessedTime = now;

            if (now.getDay() === 6) { // Saturday
                file.processedTimeFrame = 'saturday';
            } else {
                const hour = now.getHours();
                if (hour >= 7 && hour < 11) file.processedTimeFrame = 'morning';
                else if (hour >= 18 && hour < 22) file.processedTimeFrame = 'evening';
                else if (hour >= 0 && hour < 7) file.processedTimeFrame = 'new day';
            }
        }

        // Save the initial updates (without inProgress to prevent premature flagging)
        await file.save();


        // Send email and update inProgress if needed
        if (sendEmail) {
            try {

                const user = await User.findById(file.user);
                const AdminId = req.user._id

                if (user) {
                    const Admin = await User.findById(AdminId);
                    if (!Admin) {
                        return res.status(404).json({ error: 'User not found' });
                    }
                    const adminName = Admin.firstName && Admin.lastName || 'Deizy Express Team'; // Admin from request
                    const mailOptions = {
                        from: `Deizy Express <${Auth_email}>`, // Add formal sender name
                        to: user.email,
                        subject: `Document Update: ${file.fileName} in Process`, // More specific subject
                        html: generateInProgressEmail(adminName, user.firstName, file.fileName),
                        text: `Hi ${user.firstName}, we're working on your document "${file.fileName}". Track status in your account.`, // Add text version
                        headers: {
                            'Message-ID': `<${file._id}-${Date.now()}@deizyexpress.com>` // Unique ID
                        }
                    };
                    await transporter.sendMail(mailOptions);

                    // Mark email as sent
                    file.inProgress = true;
                    await file.save();
                }
            } catch (emailError) {
                console.error('Failed to send email:', emailError);
            }
        }

        return res.status(200).json({ status: 'success', message: 'File status updated.', file });
    } catch (error) {
        console.error('Error updating file status:', error);
        return res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
};


exports.updateFileAttempt = async (req, res) => {
    const { fileId } = req.params;
    const { attempts } = req.body;

    // Allowed attempt values as defined in your File model.
    const allowedAttempts = ['not attempted', 'attempted 1', 'attempted 2', 'attempted 3'];

    if (!allowedAttempts.includes(attempts)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid attempt value.',
        });
    }

    try {
        const file = await File.findByIdAndUpdate(
            fileId,
            { attempts },
            { new: true }
        );

        if (!file) {
            return res.status(404).json({
                status: 'error',
                message: 'File not found.',
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'File attempt updated.',
            file,
        });
    } catch (error) {
        console.error('Error updating file attempt:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error.',
        });
    }
};

exports.replaceFileData = async (req, res) => {
    const { fileId } = req.params;

    if (!req.file) {
        return res.status(400).json({ status: 'error', message: 'No file uploaded.' });
    }

    try {
        // Find the file by its ID
        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ status: 'error', message: 'File not found.' });
        }

        // Compress the uploaded file data
        const compressedData = zlib.gzipSync(req.file.buffer);

        // Check if the new file data is the same as the old one
        if (compressedData.equals(file.fileData)) {
            // If the data is the same, don't increment ProcessedDocument
            return res.status(200).json({
                status: 'success',
                message: 'File data is the same. No changes made.',
                file: { fileName: file.fileName, uploadedAt: file.uploadedAt },
            });
        }

        // Check if the fileData has already been replaced before
        if (file.hasBeenReplaced) {
            // If it has been replaced before, update fileData but do not increment ProcessedDocument
            file.fileData = compressedData;
            await file.save();

            return res.status(200).json({
                status: 'success',
                message: 'File data replaced without incrementing ProcessedDocument.',
                file: { fileName: file.fileName, uploadedAt: file.uploadedAt },
            });
        }

        // Update the fileData with the new compressed data and set hasBeenReplaced flag
        file.fileData = compressedData;
        file.hasBeenReplaced = true;
        await file.save();

        // Increment the ProcessedDocument count for the user who owns the file
        await User.findByIdAndUpdate(
            file.user,  // The user who owns the file
            { $inc: { ProcessedDocument: 1 } },  // Increment the ProcessedDocument count
            { new: true }
        );
        // Send processed email if not already sent
        if (!file.ProgressedEmailSent) {
            try {
                const AdminId = req.user._id
                const user = await User.findById(file.user);

                if (user) {

                    const Admin = await User.findById(AdminId);
                    if (!Admin) {
                        return res.status(404).json({ error: 'User not found' });
                    }

                    const adminName = Admin.firstName && Admin.lastName
                        ? `${Admin.firstName} ${Admin.lastName}`
                        : 'Deizy Express Team';

                    const mailOptions = {
                        from: `Deizy Express <${Auth_email}>`,
                        to: user.email,
                        subject: `Document Ready: ${file.fileName} Processed`,
                        html: generateProcessedEmail(adminName, user.firstName, file.fileName),
                        text: `Hi ${user.firstName}, your document "${file.fileName}" is ready. Login to complete payment and download.`,
                        headers: {
                            'Message-ID': `<${file._id}-${Date.now()}@deizyexpress.com>`
                        }
                    };

                    await transporter.sendMail(mailOptions);
                    file.ProgressedEmailSent = true;
                    await file.save();
                }
            } catch (emailError) {
                console.error('Failed to send processed email:', emailError);
            }
        }

        return res.status(200).json({
            status: 'success',
            message: 'File replaced and ProcessedDocument incremented.',
            file: { fileName: file.fileName, uploadedAt: file.uploadedAt },
        });
    } catch (error) {
        console.error('Error replacing file data:', error);
        return res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
};


