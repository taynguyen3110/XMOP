const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Endpoint for terraform init
router.post('/init', async (req, res) => {
    try {
        const workspaceName = req.body.workspaceName;
        const wsPath = `./workspaces/${workspaceName}/terraform/Highly Available`;

        // Check if .terraform folder exists
        const terraformFolderExists = fs.existsSync(`${wsPath}/.terraform`);

        if (terraformFolderExists) {
            // Send response indicating Terraform is already initialized
            return res.status(200).send('Terraform already initialized');
        }

        // Run Terraform init command
        const initProcess = exec('terraform init', { cwd: wsPath });
        const initResult = await waitForProcessCompletion(initProcess, 'terraform init', workspaceName);

        // If Terraform init fails, return error response
        if (initResult.code !== 0) {
            console.error(`Error initializing Terraform: ${initResult.stderr}`);
            return res.status(500).send('Error initializing Terraform');
        }

        // Send success response
        res.send('Terraform initialized successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// Endpoint for terraform plan
router.post('/plan', async (req, res) => {
    const { formData, workspace } = req.body;
    const wsName = `./workspaces/${workspace}/terraform/Highly Available`;
    try {
        // Update terraform.tfvars
        const tfvarsContent = generateTfvarsContent(formData);
        fs.writeFileSync(`${wsName}/terraform.tfvars`, tfvarsContent);

        // Run Terraform plan command
        const planProcess = exec('terraform plan', { cwd: wsName });
        const planResult = await waitForProcessCompletion(planProcess, 'terraform plan', workspace);

        // If Terraform plan fails, return error response
        if (planResult.code !== 0) {
            console.error(`Error planning Terraform: ${planResult.stderr}`);
            return res.status(500).send('Error planning Terraform');
        }

        // Send success response
        res.send(`Terraform plan generated successfully: ${planResult.stdout}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint for applying
router.post('/apply', async (req, res) => {
    const { workspace } = req.body;
    const wsName = `./workspaces/${workspace}/terraform/Highly Available`;
    try {
        // Run Terraform apply command
        const applyProcess = exec('terraform apply -auto-approve', { cwd: wsName });
        const applyResult = await waitForProcessCompletion(applyProcess, `terraform apply`, workspace);

        // If Terraform apply fails, return error response
        if (applyResult.code !== 0) {
            console.error(`Error applying Terraform: ${applyResult.stderr}`);
            return res.status(500).send('Error applying Terraform');
        }

        // Send success response
        res.send(applyResult.stdout);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint for destroying
router.post('/destroy-plan', async (req, res) => {
    const { workspace } = req.body;
    const wsName = `./workspaces/${workspace}/terraform/Highly Available`;
    try {
        // Run Terraform destroy command
        const destroyProcess = exec('terraform plan -destroy', { cwd: wsName });
        const destroyResult = await waitForProcessCompletion(destroyProcess, 'terraform destroy', workspace);

        // If Terraform destroy fails, return error response
        if (destroyResult.code !== 0) {
            console.error(`Error destroying resources: ${destroyResult.stderr}`);
            return res.status(500).send('Error destroying resources');
        }

        // Send success response
        res.send(destroyResult.stdout);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint for approved destroying
router.post('/confirm-destroy', async (req, res) => {
    const { workspace } = req.body;
    const wsName = `./workspaces/${workspace}/terraform/Highly Available`;
    try {
        // Run Terraform destroy command
        const destroyProcess = exec('terraform destroy -auto-approve', { cwd: wsName });
        const destroyResult = await waitForProcessCompletion(destroyProcess, 'terraform destroy', workspace);

        // If Terraform destroy fails, return error response
        if (destroyResult.code !== 0) {
            console.error(`Error destroying resources: ${destroyResult.stderr}`);
            return res.status(500).send('Error destroying resources');
        }

        // Send success response
        res.send(destroyResult.stdout);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

function waitForProcessCompletion(process, processName, workspace) {

    return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';

        process.stdout.on('data', data => {
            stdout += data.toString();
        });

        process.stderr.on('data', data => {
            stderr += data.toString();
        });

        process.on('close', code => {
            resolve({ code, stdout, stderr });
            const stdoutFilePath = `./workspaces/${workspace}/terraform/Highly Available/stdout.txt`;
            const stderrFilePath = `./workspaces/${workspace}/terraform/Highly Available/stderr.txt`;
            // Save stdout to file
            if (stdoutFilePath) {
                saveToFile(stdoutFilePath, stdout);
            }

            // Save stderr to file
            if (stderrFilePath) {
                saveToFile(stderrFilePath, stderr);
            }

        });


        process.on('error', error => {
            reject(new Error(`${processName} process encountered an error: ${error.message}`));
        });
    });
}

function generateTfvarsContent(formData) {
    // Generate terraform.tfvars content based on form data
    let tfvarsContent = '';

    // Loop through formData and construct the tfvarsContent string
    for (const key in formData) {
        if (formData.hasOwnProperty(key)) {
            const value = formData[key];
            if (Array.isArray(value)) {
                // Handle array values (e.g., ec2_ingress, ec2_egress, lb_ingress, lb_egress)
                tfvarsContent += `${key} = [\n`;
                value.forEach((item, index) => {
                    tfvarsContent += '{\n';
                    Object.entries(item).forEach(([key, value]) => {
                        tfvarsContent += `  ${key} = ${JSON.stringify(value)}\n`;
                    });
                    tfvarsContent += '}';

                    // Add comma if it's not the last item
                    if (index < value.length - 1) {
                        tfvarsContent += ',\n';
                    } else {
                        tfvarsContent += '\n';
                    }
                });
                tfvarsContent += `]\n`;
            } else {
                // Handle non-array values
                tfvarsContent += `${key} = ${JSON.stringify(value)}\n`;
            }
        }
    }

    return tfvarsContent;
}

function saveToFile(filePath, content) {
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File does not exist, create new file
            fs.writeFile(filePath, content, (err) => {
                if (err) {
                    console.error(`Error creating file ${filePath}:`, err);
                } else {
                    console.log(`Content saved to ${filePath}`);
                }
            });
        } else {
            // File exists, append to existing content
            fs.appendFile(filePath, content, (err) => {
                if (err) {
                    console.error(`Error appending to file ${filePath}:`, err);
                } else {
                    console.log(`Content appended to ${filePath}`);
                }
            });
        }
    });
}

module.exports = router;
