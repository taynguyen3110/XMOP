# Launch Configuration: Defines the configuration for launching Wordpress instances
resource "aws_launch_configuration" "wordpress_lc" {
  image_id                    = var.ami_id        # ID of the AMI used for the instances
  instance_type               = var.instance_type # Type of Wordpress instance
  associate_public_ip_address = true
  key_name                    = var.key_name # SSH key pair for accessing instances
  security_groups             = [var.security_group_id]
  enable_monitoring           = true

  # User data script for instance configuration based on os_option chosen by user
  user_data = base64encode(templatefile("${path.module}/${local.vars.user_data_file}", local.vars))

  depends_on = [
    aws_lb.wordpress_lb,
    aws_db_instance.wordpress_db,
    aws_efs_file_system.wordpress_efs,
    aws_efs_mount_target.wordpress_mount_target
  ] # Dependencies on other resources for creation

  lifecycle {
    create_before_destroy = true # Ensure new launch configuration is created before the old one is destroyed
  }
}

locals {
  vars = {
    id             = var.id
    dbname         = var.db_name
    dbuser         = var.username
    password       = var.password
    efs_id         = aws_efs_file_system.wordpress_efs.id                                   # ID of the EFS file system
    db_endpoint    = aws_db_instance.wordpress_db.endpoint                                  # Endpoint of the RDS instance
    lb_dns         = aws_lb.wordpress_lb.dns_name                                           # DNS name of the application load balancer
    user_data_file = var.os_option == "ubuntu" ? "userdata_ubuntu.sh" : "userdata_linux.sh" # Select the appropriate user data script after checking OS 
    region         = var.region
  }
}

# Auto Scaling Group: Defines the group of instances to be scaled automatically
resource "aws_autoscaling_group" "wordpress_asg" {
  launch_configuration = aws_launch_configuration.wordpress_lc.id
  min_size             = var.min_instance_count
  max_size             = var.max_instance_count
  desired_capacity     = var.instance_count                     # Desired number of instances
  vpc_zone_identifier  = var.ec2_subnet_ids                     # Subnets for the instances
  target_group_arns    = [aws_lb_target_group.wordpress_tg.arn] # Target group(s) for the instances
  health_check_type    = "ELB"                                  # Health check will be same to ELB

  depends_on = [aws_efs_mount_target.wordpress_mount_target] # Dependency on EFS mount target for creation

  # Tag for the autoscaling group
  tag {
    key                 = "Name"
    value               = "Wordpress App - ${var.id}"
    propagate_at_launch = true
  }
}

# Scale out policy: Increases the number of instances when CPU utilization is higher than 70%
resource "aws_autoscaling_policy" "scale_out_policy" {
  name                   = "scale-out-policy"
  adjustment_type        = "ChangeInCapacity"
  autoscaling_group_name = aws_autoscaling_group.wordpress_asg.name
  scaling_adjustment     = 1   # Increase the number of instances by 1
  cooldown               = 120 # Cooldown period in seconds
}

# CloudWatch metric alarm for scale out policy based on CPU utilization
resource "aws_cloudwatch_metric_alarm" "scale_out" {
  alarm_description   = "Monitors CPU Utilization for Wordpress ASG"
  alarm_actions       = [aws_autoscaling_policy.scale_out_policy.arn] # Scale out when the alarm is triggered
  alarm_name          = "wordpress_scale_up_${var.id}"
  comparison_operator = "GreaterThanOrEqualToThreshold" # Comparison operator
  namespace           = "AWS/EC2"
  metric_name         = "CPUUtilization" # Name of the metric
  threshold           = "70"                    # Threshold value for CPU utilization (in percentage)
  evaluation_periods  = "2"                     # Number of periods to evaluate
  period              = "60"                   # Period of the metric in seconds (1 minutes)
  statistic           = "Average"               # Average CPU utilization over the specified time period
  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.wordpress_asg.name # Dimension for autoscaling group
  }
}


# Scale in policy: Decreases the number of instances when CPU utilization is lower than 10%
resource "aws_autoscaling_policy" "scale_in_policy" {
  name                   = "scale-in-policy"
  adjustment_type        = "ChangeInCapacity"
  autoscaling_group_name = aws_autoscaling_group.wordpress_asg.name
  scaling_adjustment     = -1  # Decrease the number of instances by 1
  cooldown               = 120 # Cooldown period in seconds
}

# CloudWatch metric alarm for scale in policy based on CPU utilization
resource "aws_cloudwatch_metric_alarm" "scale_in" {
  alarm_description   = "Monitors CPU Utilization for Wordpress ASG"
  alarm_actions       = [aws_autoscaling_policy.scale_in_policy.arn] # Scale in when the alarm is triggered
  alarm_name          = "wordpress_scale_down_${var.id}"
  comparison_operator = "LessThanOrEqualToThreshold" # Comparison operator
  namespace           = "AWS/EC2"
  metric_name         = "CPUUtilization" # Name of the metric
  threshold           = "20"                    # Threshold value for CPU utilization (in percentage)
  evaluation_periods  = "2"                     # Number of periods to evaluate
  period              = "60"                   # Period of the metric in seconds (1 minutes)
  statistic           = "Average"               # Average CPU utilization over the specified time period
  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.wordpress_asg.name # Dimension for autoscaling group
  }
}

