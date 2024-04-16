# Application Load Balancer: This resource creates an AWS Application Load Balancer to channel
# incoming traffics to multiple Wordpress instances to ensure high availability.
resource "aws_lb" "wordpress_lb" {
  name               = "wordpress-lb-${var.id}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.lb_security_group_id]
  subnets            = var.lb_subnet_ids

  enable_deletion_protection = false # Disable deletion protection to allow manual deletion

  tags = {
    Name = "Application Load Balancer - ${var.id}"
  }
}

# Listener: This resource configures a listener for the Application Load Balancer.
# It listens on port 80 for HTTP traffic and forwards requests to the target group.
resource "aws_lb_listener" "wordpress_listener" {
  load_balancer_arn = aws_lb.wordpress_lb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward" # Forward action for incoming requests to the target group
    target_group_arn = aws_lb_target_group.wordpress_tg.arn
  }

  tags = {
    Name = "Listener for LB - ${var.id}"
  }
}

# Target Group: This resource defines a target group for the Application Load Balancer.
# It directs traffic to Wordpress instances on port 80 using the HTTP protocol.
# Health checks are configured to monitor the health of the instances.
resource "aws_lb_target_group" "wordpress_tg" {
  name        = "wordpress-tg-${var.id}"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "instance"

  # Health check configuration
  health_check {
    path                = "/wordpress" # Path for the health check
    port                = 80
    protocol            = "HTTP"
    interval            = 25        # Interval between health checks (in seconds)
    timeout             = 20        # Timeout for health check requests (in seconds)
    healthy_threshold   = 2         # Number of consecutive successful health checks to consider the target healthy
    unhealthy_threshold = 2         # Number of consecutive failed health checks to consider the target unhealthy
    matcher             = "200,301" # Expected HTTP status codes indicating a successful health check
  }

  depends_on = [aws_launch_configuration.wordpress_lc]

  tags = {
    Name = "Target Group - ${var.id}" # Tag for identifying the target group
  }
}
